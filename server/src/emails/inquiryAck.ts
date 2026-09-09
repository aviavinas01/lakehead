import type { InquiryDocument } from "../models/Inquiry.js";
import type { MailMessage } from "../services/mail.service.js";

/**
 * The acknowledgement the ENQUIRER receives — "we have this, here is what
 * happens next".
 *
 * Content only. How it leaves the building is mail.service.ts's problem, the
 * same as the office notification next door in inquiryEmail.ts.
 *
 * ------------------------------------------------------------------
 * WHAT THIS DELIBERATELY DOES NOT DO:
 *
 *   · It makes no promise the office has not already made. The on-screen
 *     response says "within 24 hours" and so does this, in the same words.
 *     Two different answers to "when will I hear back" is worse than one.
 *   · It asks for nothing and links nowhere that needs a decision. This is a
 *     receipt, not a second sales email; the next move belongs to the
 *     counsellor.
 *   · It quotes their own message back, because a receipt that does not say
 *     what was received is not a receipt. It also means anybody who filled
 *     the form in twice can see which one this is.
 *
 * IT IS NEVER SENT TO A CALL-BACK REQUEST, because there is no address to
 * send it to — that form asks for a name and a phone number. The caller
 * checks; see inquiry.controller.ts.
 *
 * REPLY-TO IS REQUIRED, NOT OPTIONAL, and it is the whole reason this
 * function takes an argument. The mail goes out as MAIL_FROM, which with
 * Resend need not be a real mailbox at all — an API key authorises the
 * domain, so `website@lakehead.edu.np` can be a sending identity with
 * nothing behind it. This mail invites the reader to reply, so without a
 * Reply-To pointing at a mailbox somebody actually reads, that invitation
 * bounces. The office notification has the same shape for the opposite
 * reason: it replies to the student.
 * ------------------------------------------------------------------
 */

/* The same palette as the notification, from the site's own tokens
   (client/src/styles.css). */
const NAVY = "#17275c";
const BORDER = "#e4e4e7";
const MUTED = "#71717a";

/**
 * Neutralises anything that would otherwise be read as markup.
 *
 * This matters more here than in the office notification: the office knows
 * the enquiry came off the internet, whereas this is our own branded mail
 * carrying a stranger's text back out to them. Every interpolation below is
 * escaped, including the name in the greeting.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Just the first name, when there is an obvious one. */
function firstName(full: string): string {
  const first = full.trim().split(/\s+/)[0] ?? "";
  return first.length >= 2 ? first : full.trim();
}

export function buildInquiryAck(
  inquiry: InquiryDocument,
  /** A mailbox that is read by a person — the first address on MAIL_TO. */
  replyTo: string
): MailMessage {
  const name = firstName(inquiry.name);
  const safeName = escapeHtml(name);

  const subject = "We've got your enquiry — Lakehead Education";

  const text = [
    `Hi ${name},`,
    "",
    "Thank you for getting in touch with Lakehead Education. Your enquiry has",
    "reached our counselling team and somebody will get back to you within 24",
    "hours.",
    "",
    inquiry.message ? "This is what you sent us:" : null,
    inquiry.message ? "" : null,
    inquiry.message ? inquiry.message : null,
    inquiry.message ? "" : null,
    "If you need us sooner, just reply to this email and it comes straight",
    "back to us.",
    "",
    "— The team at Lakehead Education",
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
        <p style="margin:0;color:#ffffff;font-size:19px;font-weight:700;">We&rsquo;ve got your enquiry</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 24px 8px;">
        <p style="margin:0 0 14px;color:#26262e;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;color:#26262e;font-size:15px;line-height:1.7;">
          Thank you for getting in touch. Your enquiry has reached our
          counselling team and somebody will get back to you
          <strong>within 24 hours</strong>.
        </p>
      </td>
    </tr>
    ${
      inquiry.message
        ? `<tr>
      <td style="padding:0 24px 8px;">
        <p style="margin:0 0 6px;color:${MUTED};font-size:13px;">What you sent us</p>
        <div style="padding:14px 16px;background:#f5f5f6;border-radius:10px;color:#26262e;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(
          inquiry.message
        )}</div>
      </td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding:16px 24px 24px;">
        <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
          Need us sooner? Just reply to this email &mdash; it comes straight
          back to us.
        </p>
      </td>
    </tr>
  </table>
</div>`.trim();

  return {
    subject,
    text,
    html,
    /* The one place `to` is set explicitly. Guarded by the caller, which does
       not build this at all without an address — see inquiry.controller.ts. */
    to: inquiry.email ? [inquiry.email] : [],
    /* Where "just reply to this email" actually lands. Omitted rather than
       sent empty when there is somehow no office address configured, so a
       client falls back to the From line instead of being handed a blank
       header some of them turn into a broken recipient. */
    ...(replyTo ? { replyTo } : {}),
  };
}
