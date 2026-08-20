import { Router } from "express";
import * as users from "../../controllers/user.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../../validators/user.schema.js";

const router = Router();

// Admin-only user management
router.use(protect, requireRole("admin"));
router.get("/", users.list);
router.post("/", validate(createUserSchema), users.create);
router.patch("/:id", validate(updateUserSchema), users.update);

export default router;
