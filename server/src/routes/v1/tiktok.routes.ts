import { Router } from "express";
import * as tiktok from "../../controllers/tiktok.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createTikTokSchema, updateTikTokSchema } from "../../validators/tiktok.schema.js";

const router = Router();

// Public — the row on the home page
router.get("/", tiktok.listPublished);

// Authenticated (admin + editor)
router.get("/admin/all", protect, tiktok.listAll);
router.post("/", protect, validate(createTikTokSchema), tiktok.create);
router.put("/:id", protect, validate(updateTikTokSchema), tiktok.update);
router.delete("/:id", protect, requireRole("admin"), tiktok.remove);

export default router;
