import { Router } from "express";
import * as clientError from "../../controllers/clientError.controller.js";
import { validate } from "../../middleware/validate.js";
import { clientErrorLimiter } from "../../middleware/rateLimiters.js";
import { clientErrorSchema } from "../../validators/clientError.schema.js";

/**
 * Where the browser reports a crash it could not recover from.
 *
 * PUBLIC AND UNAUTHENTICATED, because a page that has just crashed is in no
 * position to prove anything about itself, and because most crashes happen to
 * visitors rather than to admins. That makes the rate limit and the field
 * caps the whole of the defence — see the validator and the limiter.
 *
 * The CSRF guard still applies (it covers every POST under /api/v1), which
 * costs nothing here: the client posts through the shared axios instance,
 * which sets the header on every request.
 */
const router = Router();

router.post("/", clientErrorLimiter, validate(clientErrorSchema), clientError.report);

export default router;
