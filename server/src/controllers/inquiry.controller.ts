import { asyncHandler } from "../utils/asyncHandler.js";
import { inquiryService } from "../services/inquiry.service.js";
import { parsePagination } from "../utils/pagination.js";
import {
  INQUIRY_STATUSES,
  type InquiryDocument,
  type InquiryStatus,
} from "../models/Inquiry.js";
import { mailService } from "../services/mail.service.js";
import { buildInquiryEmail } from "../emails/inquiryEmail.js";

/**
 * Emails the inquiry to whoever is on MAIL_TO and records what happened.
 *
 * Called AFTER the visitor's response has been sent, and never awaited by the
 * request. That ordering is the whole design: the inquiry is already saved
 * and already acknowledged, so a mail host that is slow, misconfigured or
 * down cannot turn a working form into a broken one. The worst case is an
 * inquiry sitting in the dashboard marked "failed" for someone to pick up.
 *
 * It cannot reject: mailService.send resolves either way, and the catch below
 * is for the genuinely unexpected. An unhandled rejection here would take the
 * Node process down with it.
 */
async function notify(inquiry: InquiryDocument): Promise<void> {
  try {
    const result = await mailService.send(buildInquiryEmail(inquiry));
    await inquiryService.recordNotification(String(inquiry._id), {
      /* "skipped" rather than "failed" when mail is simply not set up — the
         difference between nothing to do and something going wrong matters
         to whoever reads this in the dashboard. */
      state: result.ok ? "sent" : mailService.configured ? "failed" : "skipped",
      at: new Date(),
      reason: result.ok ? undefined : result.reason,
    });
  } catch (err) {
    console.error("[inquiry] Notification failed unexpectedly:", err);
  }
}

export const create = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.create(req.body);

  /* Answer first. Everything below this line is our problem, not theirs. */
  res.status(201).json({
    message: "Thank you! We'll get back to you within 24 hours.",
    id: inquiry._id,
  });

  /* Intentionally not awaited — see notify(). `void` marks that as deliberate
     rather than a forgotten await. */
  void notify(inquiry);
});

export const list = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const raw = req.query.status;
  const status =
    typeof raw === "string" && (INQUIRY_STATUSES as readonly string[]).includes(raw)
      ? (raw as InquiryStatus)
      : undefined;
  res.json(await inquiryService.list(pagination, status));
});

export const update = asyncHandler(async (req, res) => {
  res.json({ inquiry: await inquiryService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await inquiryService.remove(req.params.id as string);
  res.json({ message: "Inquiry deleted" });
});

export const stats = asyncHandler(async (_req, res) => {
  res.json({ stats: await inquiryService.stats() });
});
