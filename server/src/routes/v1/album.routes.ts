import { Router } from "express";
import * as albums from "../../controllers/album.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createAlbumSchema, updateAlbumSchema } from "../../validators/album.schema.js";

const router = Router();

// Public
router.get("/", albums.listPublished);
router.get("/slug/:slug", albums.getBySlug);

// Authenticated (admin + editor)
router.get("/admin/all", protect, albums.listAll);
router.get("/admin/:id", protect, albums.getById);
router.post("/", protect, validate(createAlbumSchema), albums.create);
router.put("/:id", protect, validate(updateAlbumSchema), albums.update);
router.delete("/:id", protect, requireRole("admin"), albums.remove);

export default router;
