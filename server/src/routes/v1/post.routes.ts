import { Router } from "express";
import * as posts from "../../controllers/post.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createPostSchema, updatePostSchema } from "../../validators/post.schema.js";

const router = Router();

// Public
router.get("/", posts.listPublished);
router.get("/slug/:slug", posts.getBySlug);

// Authenticated (admin + editor)
router.get("/admin/all", protect, posts.listAll);
router.get("/admin/:id", protect, posts.getById);
router.post("/", protect, validate(createPostSchema), posts.create);
router.put("/:id", protect, validate(updatePostSchema), posts.update);
router.delete("/:id", protect, requireRole("admin"), posts.remove);

export default router;
