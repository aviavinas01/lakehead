import { Router } from "express";
import * as media from "../../controllers/media.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { upload } from "../../middleware/upload.js";
import { uploadMediaSchema, updateMediaSchema } from "../../validators/media.schema.js";

const router = Router();

// Public — browse media (e.g. gallery pages filter by ?album=<id>)
router.get("/", media.list);

// Authenticated (admin + editor)
router.post("/", protect, upload.single("file"), validate(uploadMediaSchema), media.upload);
router.patch("/:id", protect, validate(updateMediaSchema), media.update);
router.delete("/:id", protect, requireRole("admin"), media.remove);

export default router;
