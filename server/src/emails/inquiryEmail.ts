import type { InquiryDocument, InquirySource } from "../models/Inquiry.js";
import type { MailMessage } from "../services/mail.service.js";

/**
 * The notification a counsellor receives when someone fills in a form.
 *
 * Content only. How it leaves the building is mail.service.ts's problem, and
 * keeping the two apart is what makes the transport swappable.
 *
 * Written to be read on a phone, since that is where it will be read: the
 * subject carries the name and what they asked for, so the inbox list alone
 * says whether it needs answering now, and the two things a counsellor
 * actually does next — call them, or email them back — are the first things
 * in the body.
 */

/** How each form describes itself in a subject line. */
const SOURCE_LABELS: Record<InquirySource, string> = {
  consultation: "Free consultation booking",
  contact: "Contact form enquiry",
  about: "Enquiry from Who We Are",
  "study-abroad": "Study abroad enquiry",
  home: "Enquiry from the home page",
  /* Says what it is in the subject line, because it needs a different
     response from the rest: there is no message to read and no address to
     reply to — somebody has to pick up the phone. */
  callback: "Call-back request",
  unknown: "Website enquiry",
};

/* Both palettes come from the site's own tokens (client/src/styles.css). */
const NAVY = "#17275c";
const ACCENT = "#e8532c";
const BORDER = "#e4e4e7";
const MUTED = "#71717a";

/** Neutralises anything that would otherwise be read as markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px;vertical-align:top;width:110px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:#26262e;font-size:15px;vertical-align:top;">${value}</td>
    </tr>`;
}

export function buildInquiryEmail(inquiry: InquiryDocument): MailMessage {
  const label = SOURCE_LABELS[inquiry.source] ?? SOURCE_LABELS.unknown;
  const when = formatWhen(inquiry.createdAt ?? new Date());

  const name = escapeHtml(inquiry.name);
  /* A call-back request carries neither. Every use below is guarded rather
     than defaulted: an empty string would print "Email:" with nothing after
     it and a mailto: link that goes nowhere. */
  const email = inquiry.email ? escapeHtml(inquiry.email) : "";
  const phone = inquiry.phone ? escapeHtml(inquiry.phone) : "";

  const subject = `${label} — ${inquiry.name}`;

  const text = [
    label,
    "",
    `Name:    ${inquiry.name}`,
    inquiry.email ? `Email:   ${inquiry.email}` : null,
    inquiry.phone ? `Phone:   ${inquiry.phone}` : null,
    `Service: ${inquiry.service}`,
    `Sent:    ${when}`,
    "",
    inquiry.message || "(No message — they asked to be called back.)",
    "",
    inquiry.email
      ? "— Reply to this email and it goes straight to them."
      : "— No email address was given. Call the number above.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  /* Tables and inline styles on purpose. Mail clients are not browsers:
     flexbox, grid and <style> blocks are all unreliable, and Outlook in
     particular still lays out with tables. */
  const html = `
<div style="margin:0;padding:24px 12px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDER};">
    <tr>
      <td style="background:${NAVY};padding:20px 24px;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.72);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Lakehead Education</p>
        <p style="margin:0;color:#ffffff;font-size:19px;font-weight:700;">${escapeHtml(label)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 4px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          ${row("Name", name)}
          ${email ? row("Email", `<a href="mailto:${email}" style="color:${ACCENT};text-decoration:none;">${email}</a>`) : ""}
          ${phone ? row("Phone", `<a href="tel:${phone.replace(/[^\d+]/g, "")}" style="color:${ACCENT};text-decoration:none;">${phone}</a>`) : ""}
          ${row("Service", escapeHtml(inquiry.service))}
          ${row("Received", escapeHtml(when))}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px 24px;">
        <p style="margin:0 0 6px;color:${MUTED};font-size:13px;">Message</p>
        <div style="padding:14px 16px;background:#f5f5f6;border-radius:10px;color:#26262e;font-size:15px;line-height:1.6;white-space:pre-wrap;">${
          inquiry.message
            ? escapeHtml(inquiry.message)
            : "No message — they asked to be called back."
        }</div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 24px;">
        <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
          ${
            email
              ? `Reply to this email and it goes straight to ${name}.`
              : `${name} left no email address — call the number above.`
          } A copy of this enquiry is in the admin dashboard.
        </p>
      </td>
    </tr>
  </table>
</div>`.trim();

  return {
    subject,
    text,
    html,
    /* The whole point of the notification: hit Reply and you are writing to
       the student, not to ourselves. Omitted when there is no address, so
       Reply falls back to the mailbox it was sent from rather than to an
       empty header some clients turn into a broken recipient. */
    ...(inquiry.email ? { replyTo: inquiry.email } : {}),
  };
}
