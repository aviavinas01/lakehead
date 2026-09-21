import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/pagination.js";
import { testBookingService } from "../services/testBooking.service.js";
import { signatureStore } from "../services/signatureStore.js";
import { mailService } from "../services/mail.service.js";
import { buildTestBookingAck, buildTestBookingEmail } from "../emails/testBookingEmails.js";
import { INQUIRY_STATUSES, type InquiryStatus } from "../models/Inquiry.js";
import {
  TEST_PROVIDERS,
  type TestBookingDocument,
  type TestProvider,
} from "../models/TestBooking.js";
import { extensionFor } from "../utils/fileSignature.js";

/**
 * Office notification, then the candidate's receipt, each recorded on the
 * booking. Called after the response has gone and never awaited — the same
 * design, for the same reasons, as notify() in inquiry.controller.ts: a
 * slow or broken mail provider cannot turn a saved booking into a failed
 * form, and neither mail can stop the other.
 */
async function notify(booking: TestBookingDocument): Promise<void> {
  const id = String(booking._id);
  const stateFor = (result: { ok: boolean }): "sent" | "failed" | "skipped" =>
    result.ok ? "sent" : mailService.configured ? "failed" : "skipped";

  try {
    const result = await mailService.send(buildTestBookingEmail(booking));
    await testBookingService.recordNotification(id, {
      state: stateFor(result),
      at: new Date(),
      reason: result.ok ? undefined : result.reason,
    });
  } catch (err) {
    console.error("[test-booking] Notification failed unexpectedly:", err);
  }

  try {
    const result = await mailService.send(
      buildTestBookingAck(booking, mailService.recipients[0] ?? "")
    );
    await testBookingService.recordNotification(
      id,
      { state: stateFor(result), at: new Date(), reason: result.ok ? undefined : result.reason },
      "acknowledged"
    );
  } catch (err) {
    console.error("[test-booking] Acknowledgement failed unexpectedly:", err);
  }
}

export const create = asyncHandler(async (req, res) => {
  /* Every text field has already passed the schema by the time this runs —
     the route validates first — so the image is only ever stored for a
     booking that is otherwise acceptable. */
  if (!req.file) throw ApiError.badRequest("Attach an image of your signature.");

  const signature = await signatureStore.save(req.file);

  let booking: TestBookingDocument;
  try {
    booking = await testBookingService.create({ ...req.body, signature });
  } catch (err) {
    /* The record failed after the image was kept. Remove the image, or a
       failed submission would leave a stranger's signature on our disk with
       nothing pointing at it and nothing that would ever delete it. */
    await signatureStore.discard(signature);
    throw err;
  }

  res.status(201).json({
    message:
      "Thank you — we've received your booking request. A counsellor will contact you within 24 hours to confirm it.",
    id: booking._id,
  });

  void notify(booking);
});

export const list = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const rawStatus = req.query.status;
  const rawProvider = req.query.provider;
  const status =
    typeof rawStatus === "string" && (INQUIRY_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as InquiryStatus)
      : undefined;
  const provider =
    typeof rawProvider === "string" && (TEST_PROVIDERS as readonly string[]).includes(rawProvider)
      ? (rawProvider as TestProvider)
      : undefined;
  res.json(await testBookingService.list(pagination, { status, provider }));
});

export const update = asyncHandler(async (req, res) => {
  res.json({ booking: await testBookingService.update(req.params.id as string, req.body) });
});

/**
 * Deletes the booking AND its signature. The record goes first: if the image
 * then cannot be removed, what is left is an unreachable file rather than a
 * record pointing at nothing — and a delete the office asked for has still
 * happened as far as anyone can see.
 */
export const remove = asyncHandler(async (req, res) => {
  const booking = await testBookingService.remove(req.params.id as string);
  await signatureStore.discard(booking.signature);
  res.json({ message: "Test booking deleted" });
});

/**
 * The signature image — the ONLY way to see one. Admin-only (see the route),
 * streamed from wherever it is stored, never redirected to a url.
 */
export const signature = asyncHandler(async (req, res) => {
  const booking = await testBookingService.get(req.params.id as string);
  const bytes = await signatureStore.read(booking.signature);

  res.setHeader("Content-Type", booking.signature.mime);
  /* Personal data: not in any shared cache, and not kept in the admin's
     browser cache after the tab is closed either. */
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="signature-${String(booking._id)}${extensionFor(booking.signature.mime)}"`
  );
  res.send(bytes);
});
