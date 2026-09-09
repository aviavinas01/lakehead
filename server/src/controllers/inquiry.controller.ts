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
import { buildInquiryAck } from "../emails/inquiryAck.js";

/**
 * Emails the inquiry to whoever is on MAIL_TO, then acknowledges it to the
 * enquirer, and records what happened to each.
 *
 * Called AFTER the visitor's response has been sent, and never awaited by the
 * request. That ordering is the whole design: the inquiry is already saved
 * and already acknowledged on screen, so a mail provider that is slow,
 * misconfigured or down cannot turn a working form into a broken one. The
 * worst case is an inquiry sitting in the dashboard marked "failed" for
 * someone to pick up.
 *
 * THE TWO MAILS ARE INDEPENDENT, AND IN THIS ORDER. The office notification
 * goes first because it is the one the business actually needs; the
 * acknowledgement is a courtesy to the enquirer. Each is awaited, caught and
 * recorded on its own, so a bounced acknowledgement — a mistyped address,
 * which is common — cannot stop the office copy or lose its record. They are
 * sequential rather than concurrent so that a rate limit on the provider is
 * hit by one message at a time rather than by two at once.
 *
 * Neither can reject: mailService.send resolves either way, and the catches
 * are for the genuinely unexpected. An unhandled rejection here would take
 * the Node process down with it.
 */
async function notify(inquiry: InquiryDocument): Promise<void> {
  const id = String(inquiry._id);

  /* "skipped" rather than "failed" when mail is simply not set up — the
     difference between nothing to do and something going wrong matters to
     whoever reads this in the dashboard. */
  const stateFor = (result: { ok: boolean }): "sent" | "failed" | "skipped" =>
    result.ok ? "sent" : mailService.configured ? "failed" : "skipped";

  try {
    const result = await mailService.send(buildInquiryEmail(inquiry));
    await inquiryService.recordNotification(id, {
      state: stateFor(result),
      at: new Date(),
      reason: result.ok ? undefined : result.reason,
    });
  } catch (err) {
    console.error("[inquiry] Notification failed unexpectedly:", err);
  }

  /* No address, nothing to acknowledge. This is the ordinary case for a
     call-back request, which asks for a name and a phone number — so it is
     recorded as "skipped" with the reason rather than left blank, which
     would read in the dashboard as though nothing had been attempted. */
  if (!inquiry.email) {
    await inquiryService.recordNotification(
      id,
      { state: "skipped", at: new Date(), reason: "No email address was given" },
      "acknowledged"
    );
    return;
  }

  try {
    /* Replies go to the first address on MAIL_TO — a mailbox a person reads.
       Only the first, not the whole list: MAIL_TO may name several
       counsellors, and putting all of their addresses in a header the
       enquirer can see hands out the office directory. */
    const result = await mailService.send(
      buildInquiryAck(inquiry, mailService.recipients[0] ?? "")
    );
    await inquiryService.recordNotification(
      id,
      {
        state: stateFor(result),
        at: new Date(),
        reason: result.ok ? undefined : result.reason,
      },
      "acknowledged"
    );
  } catch (err) {
    console.error("[inquiry] Acknowledgement failed unexpectedly:", err);
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
