import { Router } from "express";
import * as inquiries from "../../controllers/inquiry.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createInquirySchema, updateInquirySchema } from "../../validators/inquiry.schema.js";
import { inquiryLimiter } from "../../middleware/rateLimiters.js";

const router = Router();

// Public contact form
router.post("/", inquiryLimiter, validate(createInquirySchema), inquiries.create);

// Admin/editor
router.get("/", protect, inquiries.list);
router.get("/stats", protect, inquiries.stats);
router.patch("/:id", protect, validate(updateInquirySchema), inquiries.update);
router.delete("/:id", protect, requireRole("admin"), inquiries.remove);

export default router;
