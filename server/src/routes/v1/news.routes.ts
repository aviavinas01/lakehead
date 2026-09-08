import { Router } from "express";
import * as news from "../../controllers/news.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createNewsSchema, updateNewsSchema } from "../../validators/news.schema.js";

const router = Router();

// Public — the news section
router.get("/", news.listPublished);

// Authenticated (admin + editor)
router.get("/admin/all", protect, news.listAll);
router.post("/", protect, validate(createNewsSchema), news.create);
router.patch("/:id", protect, validate(updateNewsSchema), news.update);
router.delete("/:id", protect, requireRole("admin"), news.remove);

export default router;
