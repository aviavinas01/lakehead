import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { ApiError, newRef } from "../utils/ApiError.js";
import { MAX_FILE_SIZE } from "./upload.js";
import { isProd } from "../config/env.js";

/**
 * The last thing between a thrown error and what the caller reads.
 *
 * ------------------------------------------------------------------
 * THE POINT OF EVERY BRANCH BELOW IS THE SAME: a failure a person can do
 * something about must say what it was.
 *
 * Before these branches existed, four ordinary things all answered
 * "Internal server error" with a 500:
 *
 *   · an upload over the size limit          → really 413, and fixable
 *   · a malformed id in a URL                → really 404, and harmless
 *   · a document that failed validation      → really 400, names a field
 *   · a body that was not valid JSON         → really 400, and fixable
 *
 * Every one of those is the caller's to correct, and every one of them was
 * being reported as our server falling over. That is worse than unhelpful:
 * it sends somebody to check the server logs for a file they simply need to
 * make smaller, and it hides the real 500s among the noise.
 *
 * WHAT IS DELIBERATELY *NOT* TRANSLATED is anything we cannot explain. A
 * genuine unexpected error still answers with one flat sentence and no
 * detail in production, because the alternative — echoing `err.message` —
 * leaks connection strings, file paths and query shapes to anyone who can
 * provoke one.
 *
 * EVERY UNEXPECTED 500 CARRIES A REFERENCE. It is random, means nothing on
 * its own and cannot be worked backwards into a cause, but it is printed in
 * the response AND in exactly one log line — so "I got ref 4b1e9c" finds the
 * stack trace that explains it. This is the same trick sign-in already used
 * to stay silent about *why* it refused; see ApiError.
 *
 * ORDER MATTERS HERE. ApiError is checked first because it is the one thing
 * that is already a deliberate answer — a service that has decided to say
 * "Not found" must not have that overwritten by a later branch inspecting
 * the same shape.
 * ------------------------------------------------------------------
 */

/** Bounded, because it is echoed back. A caller that asks for a 10KB URL
    should not get a 10KB error to match. */
const MAX_ECHOED_URL = 120;

export const notFound: RequestHandler = (req, res) => {
  const url = req.originalUrl.slice(0, MAX_ECHOED_URL);
  res.status(404).json({
    message: `Route not found: ${url}${req.originalUrl.length > MAX_ECHOED_URL ? "…" : ""}`,
  });
};

const megabytes = (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`;

/**
 * Multer's own failures, which are all the caller's to fix.
 *
 * `LIMIT_FILE_SIZE` is the one that actually happens: somebody picks a video
 * off a phone and it is over the cap. Saying so — with the number — is the
 * difference between a retry and a support message.
 */
const multerMessage = (err: MulterError): { status: number; message: string } => {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return {
        status: 413,
        message: `That file is too large. The limit is ${megabytes(MAX_FILE_SIZE)}.`,
      };
    case "LIMIT_FILE_COUNT":
      return { status: 400, message: "Too many files in one upload." };
    case "LIMIT_UNEXPECTED_FILE":
      return {
        status: 400,
        message: `Unexpected file field “${err.field ?? "file"}”.`,
      };
    case "LIMIT_PART_COUNT":
      return { status: 400, message: "Too many parts in that upload." };
    case "LIMIT_FIELD_KEY":
    case "LIMIT_FIELD_VALUE":
    case "LIMIT_FIELD_COUNT":
      return { status: 400, message: "The form data in that upload was too large." };
    default:
      return { status: 400, message: "That upload could not be read." };
  }
};

/* Mongoose errors are matched by `name` rather than `instanceof`. Two copies
   of mongoose in a dependency tree make `instanceof` silently false, and a
   check that quietly stops matching is worse than one that reads as a
   string comparison. */
interface MongooseLike {
  name?: string;
  path?: string;
  kind?: string;
  errors?: Record<string, { path?: string; message?: string }>;
  code?: number;
  type?: string;
  statusCode?: number;
  status?: number;
  message?: string;
  stack?: string;
  field?: string;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const e = (err ?? {}) as MongooseLike;

  /* ---- 1. a deliberate answer from our own code ---- */
  if (err instanceof ApiError) {
    /* The ref, when there is one, is the only thing distinguishing two
       identical refusals — see newRef in ApiError. It carries no meaning by
       itself, so echoing it tells a caller nothing it did not already know. */
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.ref ? { ref: err.ref } : {}),
    });
  }

  /* ---- 2. uploads ---- */
  if (err instanceof MulterError || e.name === "MulterError") {
    const { status, message } = multerMessage(err as MulterError);
    return res.status(status).json({ message });
  }

  /* ---- 3. a body Express could not parse ----
     express.json() throws a SyntaxError carrying the raw body, and a
     `entity.too.large` for anything over the 1MB cap. Both are the caller's
     to fix and neither is an outage. */
  if (e.type === "entity.too.large") {
    return res
      .status(413)
      .json({ message: "That request was too large to process." });
  }
  if (err instanceof SyntaxError && "body" in (err as object)) {
    return res
      .status(400)
      .json({ message: "The request body was not valid JSON." });
  }

  /* ---- 4. a malformed id ----
     A CastError on `_id` means the value in the URL could not name a
     document — so the honest answer is 404, not 400: nothing exists there
     and nothing the caller changes about their request will make it exist.
     A cast failure on any OTHER path came from the body and is a 400. */
  if (e.name === "CastError") {
    return e.path === "_id"
      ? res.status(404).json({ message: "Not found." })
      : res.status(400).json({
          message: `“${e.path ?? "A value"}” is not in the expected format.`,
        });
  }

  /* ---- 5. a document that failed its schema ----
     Named field by field. A validation failure the caller cannot see the
     shape of is a guessing game. */
  if (e.name === "ValidationError" && e.errors) {
    const errors = Object.values(e.errors).map((issue) => ({
      path: issue.path ?? "",
      message: issue.message ?? "Invalid value",
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  /* ---- 6. a unique index ---- */
  if (e.code === 11000) {
    return res.status(409).json({ message: "Duplicate value for a unique field" });
  }

  /* ---- 7. anything we did not expect ----
     One sentence, no detail in production, and a reference that ties it to
     the single log line below. */
  const ref = newRef();
  console.error(
    `[500 ${ref}] ${req.method} ${req.originalUrl.slice(0, MAX_ECHOED_URL)}`,
    err
  );

  res.status(500).json({
    message: "Something went wrong at our end.",
    ref,
    ...(isProd ? {} : { detail: e.message, stack: e.stack }),
  });
};
