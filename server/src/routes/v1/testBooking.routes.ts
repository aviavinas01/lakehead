import { Router } from "express";
import * as bookings from "../../controllers/testBooking.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { signatureUpload } from "../../middleware/signatureUpload.js";
import { testBookingLimiter } from "../../middleware/rateLimiters.js";
import {
  createTestBookingSchema,
  testBookingIdSchema,
  updateTestBookingSchema,
} from "../../validators/testBooking.schema.js";

const router = Router();

/*
 * Public: the booking form. ORDER MATTERS:
 *
 *   limiter   before anything is read, so a flood costs us nothing;
 *   upload    parses the multipart body — the text fields into req.body and
 *             the image into memory. Nothing is written anywhere yet;
 *   validate  every text field, BEFORE the image is kept;
 *   create    stores the image, then the record.
 *
 * Validating before storing is what means a rejected form never leaves a
 * stranger's signature behind.
 */
router.post(
  "/",
  testBookingLimiter,
  signatureUpload,
  validate(createTestBookingSchema),
  bookings.create
);

/* Admin/editor — the same access as the enquiries tab it sits beside. */
router.get("/", protect, bookings.list);
router.get("/:id/signature", protect, validate(testBookingIdSchema), bookings.signature);
router.patch("/:id", protect, validate(updateTestBookingSchema), bookings.update);
/* Admin only, as with enquiries: this destroys personal data for good. */
router.delete("/:id", protect, requireRole("admin"), validate(testBookingIdSchema), bookings.remove);

export default router;
