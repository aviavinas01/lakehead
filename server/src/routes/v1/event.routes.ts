import { Router } from "express";
import * as events from "../../controllers/event.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createEventSchema, updateEventSchema } from "../../validators/event.schema.js";

const router = Router();

// Public — the listing on /events
router.get("/", events.listPublished);

// Authenticated (admin + editor). Drafts are only visible through this one.
router.get("/admin/all", protect, events.listAll);
router.post("/", protect, validate(createEventSchema), events.create);
router.patch("/:id", protect, validate(updateEventSchema), events.update);
/* Deleting is admin-only, matching posts and media: an editor may write and
   correct an entry, but removing one is not recoverable from this screen. */
router.delete("/:id", protect, requireRole("admin"), events.remove);

export default router;
