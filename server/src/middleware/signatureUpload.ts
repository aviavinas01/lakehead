import type { RequestHandler } from "express";
import multer, { MulterError } from "multer";
import { ApiError } from "../utils/ApiError.js";
import { SIGNATURE_MAX_BYTES, SIGNATURE_MIMES } from "../services/signatureStore.js";

/**
 * Reads the test-booking form: its text fields and one signature image.
 *
 * ------------------------------------------------------------------
 * THE ONLY UPLOAD ON THE SITE THAT DOES NOT NEED A SIGN-IN, so it is a
 * separate multer instance rather than the admin one in upload.ts, and it is
 * much narrower:
 *
 *   · MEMORY, never disk. multer writes nothing anywhere; signatureStore
 *     decides where the bytes go only after the file and every other field
 *     have been checked. A disk storage engine would write into the public
 *     uploads folder first and ask questions afterwards.
 *   · 2 MB, one file, one named field, images only. The admin limit is
 *     200 MB because it takes videos; a stranger's form has no business
 *     being able to spend that.
 *   · Capped text fields too. A multipart body can carry any number of
 *     arbitrarily long text parts, and they sit in memory the same way the
 *     file does.
 *
 * ITS ERRORS ARE ITS OWN. The global handler describes an oversized file
 * using the ADMIN limit — "the limit is 200 MB" — which here would be
 * exactly wrong. So multer's errors are translated before they get there.
 * ------------------------------------------------------------------
 */

const parser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: SIGNATURE_MAX_BYTES,
    files: 1,
    /* The form has eleven fields; this leaves room without leaving room to
       abuse. */
    fields: 20,
    /* The longest real field is an email address. */
    fieldSize: 2 * 1024,
    parts: 25,
  },
  fileFilter: (_req, file, cb) => {
    if ((SIGNATURE_MIMES as readonly string[]).includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest("Your signature must be a JPG, PNG or WebP image."));
  },
}).single("signature");

export const signatureUpload: RequestHandler = (req, res, next) => {
  parser(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof MulterError) {
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          return next(new ApiError(413, "Your signature image must be under 2 MB."));
        case "LIMIT_FILE_COUNT":
        case "LIMIT_UNEXPECTED_FILE":
          return next(ApiError.badRequest("Attach one signature image, in the signature field."));
        default:
          return next(ApiError.badRequest("The form could not be read. Please try again."));
      }
    }
    next(err);
  });
};
