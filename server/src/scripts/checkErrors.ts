// npx tsx src/scripts/checkErrors.ts
//
// Every error the API can answer with, driven through the REAL middleware on
// a real port — not by calling the handler with a hand-made object, which
// would prove only that the switch statement compiles.
//
// The four cases that matter are the ones that used to answer "Internal
// server error" with a 500: an oversized upload, a malformed id, a failed
// validation, and a body that was not JSON. Each is something the caller can
// fix, and each was being reported as our server falling over.
//
// It needs no database: the routes below throw the errors directly, which is
// exactly what mongoose, multer and express.json would hand the handler.
import express from "express";
import type { AddressInfo } from "node:net";
import { MulterError } from "multer";
import { ApiError } from "../utils/ApiError.js";
import { errorHandler, notFound } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isProd } from "../config/env.js";

let fails = 0;
const ok = (label: string, cond: boolean, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "ok  " : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

/* The shapes mongoose actually throws. Matched by `name` in the handler, so
   these reproduce the branch faithfully without needing a live connection. */
const castError = (path: string) =>
  Object.assign(new Error(`Cast to ObjectId failed for value "abc" at path "${path}"`), {
    name: "CastError",
    path,
    kind: "ObjectId",
  });

const validationError = () =>
  Object.assign(new Error("Validation failed"), {
    name: "ValidationError",
    errors: {
      title: { path: "title", message: "Path `title` is required." },
      order: { path: "order", message: "Path `order` must be a number." },
    },
  });

const duplicateKey = () => Object.assign(new Error("E11000 duplicate key"), { code: 11000 });

const tooLarge = () =>
  Object.assign(new Error("request entity too large"), { type: "entity.too.large" });

const app = express();
app.use(express.json({ limit: "1kb" }));

app.get("/api-error", () => {
  throw ApiError.notFound("No such article.");
});
app.get("/api-error-ref", () => {
  throw new ApiError(401, "Invalid email or password", "abc123");
});
app.get("/multer-size", () => {
  throw new MulterError("LIMIT_FILE_SIZE");
});
app.get("/multer-unexpected", () => {
  throw new MulterError("LIMIT_UNEXPECTED_FILE", "avatar");
});
app.get("/cast-id", () => {
  throw castError("_id");
});
app.get("/cast-other", () => {
  throw castError("order");
});
app.get("/validation", () => {
  throw validationError();
});
app.get("/duplicate", () => {
  throw duplicateKey();
});
app.get("/too-large", () => {
  throw tooLarge();
});
app.get("/boom", () => {
  throw new Error("a real bug with a secret in it: mongodb://user:pw@host");
});
/* Proves the async path still reaches the handler at all. */
app.get(
  "/async-boom",
  asyncHandler(async () => {
    throw ApiError.badRequest("Async refusal.");
  })
);
/* A body express.json cannot parse — the SyntaxError branch. */
app.post("/json", (req, res) => res.json({ got: req.body }));

app.use(notFound);
app.use(errorHandler);

interface Answer {
  status: number;
  body: Record<string, unknown>;
}

const call = async (
  base: string,
  path: string,
  init?: RequestInit
): Promise<Answer> => {
  const res = await fetch(`${base}${path}`, init);
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    /* A non-JSON error response is itself a failure; the assertions catch it. */
  }
  return { status: res.status, body };
};

const run = async () => {
  const server = app.listen(0);
  await new Promise<void>((r) => server.once("listening", () => r()));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  console.log("--- 1. our own deliberate answers still pass through ---");
  let a = await call(base, "/api-error");
  ok("ApiError keeps its status", a.status === 404, `got ${a.status}`);
  ok("ApiError keeps its message", a.body.message === "No such article.");
  ok("no ref when none was set", a.body.ref === undefined);

  a = await call(base, "/api-error-ref");
  ok("ApiError echoes its ref", a.body.ref === "abc123");
  ok("sign-in message is unchanged", a.body.message === "Invalid email or password");

  a = await call(base, "/async-boom");
  ok("async throws still reach the handler", a.status === 400, `got ${a.status}`);

  console.log("\n--- 2. uploads: was 500, now says what broke ---");
  a = await call(base, "/multer-size");
  ok("oversized upload is 413, not 500", a.status === 413, `got ${a.status}`);
  ok(
    "names the actual limit",
    typeof a.body.message === "string" && /\d+ MB/.test(a.body.message),
    String(a.body.message)
  );
  ok("does not say 'Internal server error'", a.body.message !== "Internal server error");

  a = await call(base, "/multer-unexpected");
  ok("unexpected field is 400", a.status === 400, `got ${a.status}`);
  ok(
    "names the field",
    typeof a.body.message === "string" && a.body.message.includes("avatar"),
    String(a.body.message)
  );

  console.log("\n--- 3. a malformed id: was 500, now 404 ---");
  a = await call(base, "/cast-id");
  ok("bad _id is 404", a.status === 404, `got ${a.status}`);
  ok("says Not found", a.body.message === "Not found.");
  /* The important negative: a 404 must not describe the cast failure, which
     would confirm the id reached the database and name the field. */
  ok(
    "leaks no internals",
    !String(a.body.message).toLowerCase().includes("objectid"),
    String(a.body.message)
  );

  a = await call(base, "/cast-other");
  ok("a bad body field is 400, not 404", a.status === 400, `got ${a.status}`);
  ok(
    "names the field",
    typeof a.body.message === "string" && a.body.message.includes("order"),
    String(a.body.message)
  );

  console.log("\n--- 4. validation: was 500, now 400 naming each field ---");
  a = await call(base, "/validation");
  ok("is 400", a.status === 400, `got ${a.status}`);
  const errors = a.body.errors as Array<{ path: string; message: string }> | undefined;
  ok("lists both failed fields", errors?.length === 2, JSON.stringify(errors));
  ok("names title", Boolean(errors?.some((i) => i.path === "title")));
  ok("names order", Boolean(errors?.some((i) => i.path === "order")));

  console.log("\n--- 5. bodies express could not read ---");
  a = await call(base, "/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ not json",
  });
  ok("malformed JSON is 400, not 500", a.status === 400, `got ${a.status}`);
  ok("says so plainly", a.body.message === "The request body was not valid JSON.");

  a = await call(base, "/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pad: "x".repeat(4000) }),
  });
  ok("an oversized body is 413, not 500", a.status === 413, `got ${a.status}`);

  a = await call(base, "/too-large");
  ok("entity.too.large thrown directly is 413", a.status === 413, `got ${a.status}`);

  console.log("\n--- 6. a duplicate key ---");
  a = await call(base, "/duplicate");
  ok("is 409", a.status === 409, `got ${a.status}`);

  console.log("\n--- 7. a genuine bug: one sentence, a ref, and no secrets ---");
  a = await call(base, "/boom");
  ok("is 500", a.status === 500, `got ${a.status}`);
  ok("carries a reference", typeof a.body.ref === "string" && /^[0-9a-f]{6}$/.test(String(a.body.ref)), String(a.body.ref));
  ok("says something human", a.body.message === "Something went wrong at our end.");
  const whole = JSON.stringify(a.body);
  ok(
    "the message itself leaks no connection string",
    !String(a.body.message).includes("mongodb://"),
    String(a.body.message)
  );

  /* THE ASSERTION FLIPS WITH THE MODE, and both directions are the point.
     In development the stack is an affordance — you want it in the response
     rather than hunting the terminal. In production the same field would
     hand anyone who can provoke a 500 a connection string, a file path and
     the shape of the query. Run this script both ways; the production run
     is the one that matters. */
  if (isProd) {
    ok("production sends NO detail", a.body.detail === undefined);
    ok("production sends NO stack", a.body.stack === undefined);
    ok(
      "nothing in the whole body leaks the connection string",
      !whole.includes("mongodb://"),
      whole.slice(0, 120)
    );
    ok("production still sends the ref", typeof a.body.ref === "string");
  } else {
    ok(
      "development still gets the detail it needs",
      whole.includes("mongodb://"),
      "expected detail in non-production"
    );
  }

  console.log("\n--- 8. an unknown route ---");
  a = await call(base, "/no/such/route");
  ok("is 404", a.status === 404, `got ${a.status}`);
  ok(
    "names the route",
    typeof a.body.message === "string" && a.body.message.includes("/no/such/route")
  );

  a = await call(base, `/${"z".repeat(400)}`);
  ok(
    "a very long url is truncated in the echo",
    typeof a.body.message === "string" && a.body.message.length < 200,
    `len ${String(a.body.message).length}`
  );

  await new Promise<void>((r) => server.close(() => r()));

  console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
  process.exit(fails === 0 ? 0 : 1);
};

void run();
