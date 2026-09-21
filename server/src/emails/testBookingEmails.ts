import type { TestBookingDocument, TestModule, TestProvider } from "../models/TestBooking.js";
import type { MailMessage } from "../services/mail.service.js";

/**
 * The two emails a test booking sends: one to the office, one back to the
 * candidate. Content only — mail.service.ts delivers them, exactly as it
 * does for enquiries (see inquiryEmail.ts and inquiryAck.ts, which these
 * follow in shape and tone).
 *
 * ------------------------------------------------------------------
 * NEITHER CARRIES THE PASSPORT NUMBER OR THE SIGNATURE. Email is copied,
 * forwarded, synced to phones and kept forever; a passport number and a
 * signature together are most of what somebody needs to impersonate the
 * candidate. The office email says the booking exists and who to call, and
 * points at the dashboard, which is the one place both are kept and the one
 * place they can be deleted from.
 *
 * THE CANDIDATE'S COPY SAYS "REQUEST", NOT "BOOKING". Nothing is booked
 * until a counsellor has registered them with the provider and the fee is
 * paid. A receipt that read like a confirmation would send somebody to a
 * test centre with no seat — the one outcome worse than no email at all.
 * ------------------------------------------------------------------
 */

const NAVY = "#17275c";
const ACCENT = "#b93815";
const BORDER = "#e4e4e7";
const MUTED = "#71717a";

export const PROVIDER_LABELS: Record<TestProvider, string> = {
  idp: "IDP IELTS",
  "british-council": "British Council IELTS",
};

export const MODULE_LABELS: Record<TestModule, string> = {
  academic: "Academic",
  "general-training": "General Training",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The exam date is a calendar day stored at UTC midnight, so it is formatted
    in UTC — formatting it in Kathmandu time would be correct today and wrong
    for anybody reading from a timezone behind UTC. */
function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Kathmandu time, because that is where whoever reads this is sitting. */
function formatWhen(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(date);
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px;vertical-align:top;width:130px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:#26262e;font-size:15px;vertical-align:top;">${value}</td>
    </tr>`;
}

function frame(title: string, body: string): string {
  /* Tables and inline styles on purpose — mail clients are not browsers. */
  return `
<div style="margin:0;padding:24px 12px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDER};">
    <tr>
      <td style="background:${NAVY};padding:20px 24px;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.72);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Lakehead Education</p>
        <p style="margin:0;color:#ffffff;font-size:19px;font-weight:700;">${escapeHtml(title)}</p>
      </td>
    </tr>
    ${body}
  </table>
</div>`.trim();
}

/** The office notification. Reply goes to the candidate. */
export function buildTestBookingEmail(booking: TestBookingDocument): MailMessage {
  const provider = PROVIDER_LABELS[booking.provider];
  const module = MODULE_LABELS[booking.module];
  const exam = formatDay(booking.examDate);
  const when = formatWhen(booking.createdAt ?? new Date());
  const title = `${provider} booking request`;

  const text = [
    title,
    "",
    `Name (as in passport): ${booking.fullName}`,
    `Exam date:  ${exam}`,
    `Test city:  ${booking.testCity}`,
    `Module:     ${module}`,
    `Email:      ${booking.email}`,
    booking.alternateEmail ? `Alt email:  ${booking.alternateEmail}` : null,
    `Phone:      ${booking.phone}`,
    `Received:   ${when}`,
    "",
    "The passport number and signature are in the admin dashboard under",
    "Inquiries → Test bookings. They are not sent by email.",
    "",
    "— Reply to this email and it goes straight to the candidate.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const email = escapeHtml(booking.email);
  const phone = escapeHtml(booking.phone);

  const html = frame(
    title,
    `
    <tr>
      <td style="padding:8px 24px 4px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          ${row("Name", escapeHtml(booking.fullName))}
          ${row("Exam date", `<strong>${escapeHtml(exam)}</strong>`)}
          ${row("Test city", escapeHtml(booking.testCity))}
          ${row("Module", escapeHtml(module))}
          ${row("Email", `<a href="mailto:${email}" style="color:${ACCENT};text-decoration:none;">${email}</a>`)}
          ${booking.alternateEmail ? row("Alt email", escapeHtml(booking.alternateEmail)) : ""}
          ${row("Phone", `<a href="tel:${phone.replace(/[^\d+]/g, "")}" style="color:${ACCENT};text-decoration:none;">${phone}</a>`)}
          ${row("Received", escapeHtml(when))}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px 24px;">
        <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
          The passport number and signature are in the admin dashboard under
          <strong>Inquiries &rarr; Test bookings</strong> &mdash; deliberately
          not sent by email. Reply to this email and it goes straight to the
          candidate.
        </p>
      </td>
    </tr>`
  );

  return { subject: `${title} — ${booking.fullName}`, text, html, replyTo: booking.email };
}

/** The receipt the CANDIDATE receives. See the note at the top on wording. */
export function buildTestBookingAck(
  booking: TestBookingDocument,
  /** A mailbox a person reads — the first address on MAIL_TO. */
  replyTo: string
): MailMessage {
  const provider = PROVIDER_LABELS[booking.provider];
  const module = MODULE_LABELS[booking.module];
  const exam = formatDay(booking.examDate);
  const first = booking.fullName.trim().split(/\s+/)[0] ?? booking.fullName;

  const text = [
    `Hi ${first},`,
    "",
    `We've received your request to book the ${provider} test:`,
    "",
    `  Exam date: ${exam}`,
    `  Test city: ${booking.testCity}`,
    `  Module:    ${module}`,
    "",
    "This is a request, not a confirmed booking. A counsellor will be in",
    "touch within 24 hours to confirm the date and the fee and complete the",
    "registration with the test provider. Your seat is only held once that",
    "is done.",
    "",
    "If any of the details above are wrong, just reply to this email.",
    "",
    "— The team at Lakehead Education",
  ].join("\n");

  const html = frame(
    "We've got your booking request",
    `
    <tr>
      <td style="padding:24px 24px 8px;">
        <p style="margin:0 0 14px;color:#26262e;font-size:16px;line-height:1.6;">Hi ${escapeHtml(first)},</p>
        <p style="margin:0 0 14px;color:#26262e;font-size:15px;line-height:1.7;">
          We&rsquo;ve received your request to book the
          <strong>${escapeHtml(provider)}</strong> test:
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          ${row("Exam date", `<strong>${escapeHtml(exam)}</strong>`)}
          ${row("Test city", escapeHtml(booking.testCity))}
          ${row("Module", escapeHtml(module))}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 24px 8px;">
        <div style="padding:14px 16px;background:#fff7ed;border-left:3px solid ${ACCENT};border-radius:8px;color:#26262e;font-size:14px;line-height:1.6;">
          <strong>This is a request, not a confirmed booking.</strong>
          A counsellor will be in touch <strong>within 24 hours</strong> to
          confirm the date and the fee and complete your registration with the
          test provider. Your seat is only held once that is done.
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 24px 24px;">
        <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
          If any of the details above are wrong, just reply to this email.
        </p>
      </td>
    </tr>`
  );

  return {
    subject: `Your ${provider} booking request — Lakehead Education`,
    text,
    html,
    to: [booking.email],
    ...(replyTo ? { replyTo } : {}),
  };
}
