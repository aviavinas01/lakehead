import { Router } from "express";
import * as youtube from "../../controllers/youtube.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createYouTubeSchema,
  updateYouTubeSchema,
} from "../../validators/youtube.schema.js";

const router = Router();

/* Public: the Success Stories row on the home page, and the testimonial row
   on Study Abroad. Answers from the curated picks when there are any and
   from the playlist feed when there are not — see the controller. */
router.get("/videos", youtube.listVideos);

/* Public: why that row is empty, when it is. Carries no ids or secrets. */
router.get("/status", youtube.status);

/* Authenticated (admin + editor) — curating those rows. */
router.get("/admin/all", protect, youtube.listAll);
router.post("/", protect, validate(createYouTubeSchema), youtube.create);
router.patch("/:id", protect, validate(updateYouTubeSchema), youtube.update);
router.delete("/:id", protect, requireRole("admin"), youtube.remove);

export default router;
