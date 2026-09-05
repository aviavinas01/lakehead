import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

/**
 * Outgoing mail: one transport, one send function, and a promise that neither
 * of them can ever throw.
 *
 * This file is the only place in the server that knows how mail leaves the
 * building. Everything above it deals in "send this message" and a result
 * object — so moving from a plain mailbox to Resend, SendGrid or Postmark
 * later is a change to this file and nothing else.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: sending mail must never be able to
 * fail a visitor's request. `send` catches everything and returns a result
 * instead of rejecting. A dead mail host, a wrong password, a network blip —
 * all of them come back as { ok: false }, get recorded against the inquiry,
 * and are somebody's problem tomorrow rather than an error message in front
 * of a student who filled in a form correctly.
 *
 * Unconfigured is a normal state, not an error. With no MAIL_* variables set
 * the server runs exactly as it did before this file existed: forms save,
 * the dashboard fills up, and nothing is emailed. That is what makes the
 * feature safe to deploy before the credentials exist.
 *
 * Configuration lives in config/env.ts, which documents each variable.
 */

export type MailResult =
  | { ok: true }
  /** `reason` is short enough to store on the inquiry and read in the admin. */
  | { ok: false; reason: string };

export interface MailMessage {
  subject: string;
  text: string;
  html: string;
  /** Where a reply should go — the enquirer, not us. See inquiryEmail.ts. */
  replyTo?: string;
}

/**
 * A mailbox is only usable when we know where to connect, who to log in as,
 * and who to notify. Anything less and there is nothing to attempt.
 */
export const mailConfigured = Boolean(
  env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS && env.MAIL_TO
);

/**
 * The address mail is sent as. Never the enquirer's own address, however
 * convenient that would be for hitting Reply: sending as a domain we are not
 * authorised for is what SPF and DMARC exist to reject, and it is the fastest
 * way to have everything we send treated as spam. The enquirer goes in
 * Reply-To instead.
 */
const from = env.MAIL_FROM || env.MAIL_USER || "";

/* Split on commas so several people can be notified from one variable. */
const recipients = (env.MAIL_TO ?? "")
  .split(",")
  .map((a) => a.trim())
  .filter(Boolean);

/**
 * Built once, on first use, and then reused — nodemailer pools the connection
 * and rebuilding it per message would mean a fresh TLS handshake every time.
 * Lazy rather than at import so that a server with no mail configured never
 * constructs one at all.
 */
let transport: Transporter | null = null;

function getTransport(): Transporter {
  if (transport) return transport;
  transport = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT ?? 587,
    /* true only on 465. On 587 the connection opens in the clear and STARTTLS
       upgrades it, so this must stay false or the handshake never completes. */
    secure: env.MAIL_SECURE === "true",
    auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
    /* A mail host that accepts the connection and then says nothing would
       otherwise hold a socket open indefinitely. Ten seconds is far longer
       than a healthy send takes and short enough to fail cleanly. */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transport;
}

/* Logged once rather than per message: an unconfigured server would otherwise
   print a line for every form submission it ever receives. */
let warnedUnconfigured = false;

export const mailService = {
  configured: mailConfigured,
  recipients,

  /**
   * Sends to MAIL_TO. Resolves either way — see the rule at the top of this
   * file. Callers record the result; they never branch on an exception.
   */
  async send(message: MailMessage): Promise<MailResult> {
    if (!mailConfigured) {
      if (!warnedUnconfigured) {
        warnedUnconfigured = true;
        console.warn(
          "[mail] Not configured — set MAIL_HOST, MAIL_USER, MAIL_PASS and " +
            "MAIL_TO to turn on inquiry notifications. Inquiries are still " +
            "being saved and are visible in the admin dashboard."
        );
      }
      return { ok: false, reason: "Mail is not configured on the server" };
    }

    try {
      await getTransport().sendMail({
        from,
        to: recipients,
        subject: message.subject,
        text: message.text,
        html: message.html,
        replyTo: message.replyTo,
      });
      return { ok: true };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error("[mail] Send failed:", reason);
      /* Trimmed: this is stored on the inquiry document and shown in the
         admin, and some SMTP servers reply with a wall of diagnostics. */
      return { ok: false, reason: reason.slice(0, 300) };
    }
  },

  /**
   * Opens a connection and authenticates without sending anything — for
   * checking credentials at deploy time rather than finding out from the
   * first student who fills in a form. Also never throws.
   */
  async verify(): Promise<MailResult> {
    if (!mailConfigured) {
      return { ok: false, reason: "Mail is not configured on the server" };
    }
    try {
      await getTransport().verify();
      return { ok: true };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: reason.slice(0, 300) };
    }
  },
};
