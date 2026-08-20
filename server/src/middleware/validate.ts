import type { RequestHandler } from "express";
import type { AnyZodObject } from "zod";

/** Validates req against a Zod schema shaped as { body?, params?, query? }. */
export const validate =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }
    // Use parsed (and defaulted/coerced) values
    if (result.data.body) req.body = result.data.body;
    next();
  };
