import { Router } from "express";
import * as auth from "../../controllers/auth.controller.js";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema } from "../../validators/auth.schema.js";
import { loginLimiter } from "../../middleware/rateLimiters.js";

const router = Router();

router.post("/login", loginLimiter, validate(loginSchema), auth.login);
router.post("/logout", auth.logout);
router.get("/me", protect, auth.me);

export default router;
