import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    /* The ref, when there is one, is the only thing distinguishing two
       identical refusals — see newRef in ApiError. It carries no meaning by
       itself, so echoing it tells a caller nothing it did not already know. */
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.ref ? { ref: err.ref } : {}),
    });
  }

  // Mongo duplicate key
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate value for a unique field" });
  }

  console.error(err);
  res.status(500).json({
    message: "Internal server error",
    ...(isProd ? {} : { detail: err?.message, stack: err?.stack }),
  });
};
