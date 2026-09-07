import { Router } from "express";
import * as auth from "../../controllers/auth.controller.js";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema } from "../../validators/auth.schema.js";
import { loginLimiter } from "../../middleware/rateLimiters.js";
import { requirePass } from "../../middleware/gate.js";

const router = Router();

/* `requirePass` FIRST, before the limiter even. Without a pass from the
   hidden door this endpoint does not answer at all, so a bot that has never
   found the door cannot spend the sign-in allowance of the person who has. */
router.post("/login", requirePass, loginLimiter, validate(loginSchema), auth.login);
router.post("/logout", auth.logout);
router.get("/me", protect, auth.me);

export default router;
