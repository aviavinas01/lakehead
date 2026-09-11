import { Router } from "express";
import * as media from "../../controllers/media.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { uploadLimiter } from "../../middleware/rateLimiters.js";
import { validate } from "../../middleware/validate.js";
import { upload } from "../../middleware/upload.js";
import { uploadMediaSchema, updateMediaSchema } from "../../validators/media.schema.js";

const router = Router();

// Public — browse media (e.g. gallery pages filter by ?album=<id>)
router.get("/", media.list);

// Authenticated (admin + editor)
/* The two routes that write bytes. `uploadLimiter` sits before multer so a
   refused request is rejected before the file is read, not after. */
router.post(
  "/",
  protect,
  uploadLimiter,
  upload.single("file"),
  validate(uploadMediaSchema),
  media.upload
);
/* Swaps the file behind an existing record — see mediaService.replaceFile
   for why this is not a delete plus an upload. Same permission as uploading:
   an editor who may add a picture may correct one. */
router.put(
  "/:id/file",
  protect,
  uploadLimiter,
  upload.single("file"),
  media.replaceFile
);
router.patch("/:id", protect, validate(updateMediaSchema), media.update);
router.delete("/:id", protect, requireRole("admin"), media.remove);

export default router;
