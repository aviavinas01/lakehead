import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

/**
 * Outgoing mail: one send function, two possible transports, and a promise
 * that none of them can ever throw.
 *
 * This file is the only place in the server that knows how mail leaves the
 * building. Everything above it deals in "send this message" and a result
 * object — which is what made adding Resend a change to this file and
 * nothing else.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: sending mail must never be able to
 * fail a visitor's request. `send` catches everything and returns a result
 * instead of rejecting. A dead mail host, a wrong password, a revoked API
 * key, a network blip — all of them come back as { ok: false }, get recorded
 * against the inquiry, and are somebody's problem tomorrow rather than an
 * error message in front of a student who filled in a form correctly.
 *
 * ------------------------------------------------------------------
 * WHICH TRANSPORT RUNS, in order. The first one that is configured wins:
 *
 *   1. RESEND_API_KEY set  → Resend's HTTPS API
 *   2. MAIL_HOST + MAIL_USER + MAIL_PASS set  → SMTP, via nodemailer
 *   3. neither             → nothing is sent, and inquiries are marked
 *                            "skipped" so the admin says why
 *
 * MAIL_TO is required either way: it is WHO to write to, which is a separate
 * question from HOW. MAIL_FROM likewise.
 *
 * Resend is preferred because it is one HTTPS request. There is no SMTP port
 * to be blocked or throttled by a host, no TLS handshake and no multi-step
 * dialogue to time out halfway through, and a rejection arrives as a
 * sentence rather than as an SMTP transcript that has to be read to be
 * understood. SMTP is kept rather than replaced so that an ordinary mailbox
 * is still a working answer if the account is ever closed — removing one
 * environment variable falls back to it.
 *
 * NO SDK. Resend's API is a single authenticated POST with a JSON body, and
 * Node 22 has fetch built in. A dependency to construct one request is a
 * supply-chain risk and a version to keep current for no benefit.
 * ------------------------------------------------------------------
 *
 * Unconfigured is a normal state, not an error. With nothing set the server
 * runs exactly as it did before any of this existed: forms save, the
 * dashboard fills up, and nothing is emailed. That is what makes the feature
 * safe to deploy before the credentials exist.
 *
 * Configuration lives in config/env.ts, which documents each variable.
 */

export type MailResult =
  | { ok: true; id?: string }
  /** `reason` is short enough to store on the inquiry and read in the admin. */
  | { ok: false; reason: string };

export interface MailMessage {
  subject: string;
  text: string;
  html: string;
  /** Where a reply should go — the enquirer, not us. See inquiryEmail.ts. */
  replyTo?: string;
  /**
   * Who receives it. Defaults to MAIL_TO, which is the office.
   *
   * Overridden only to write to the enquirer themselves — the acknowledgement
   * in emails/inquiryAck.ts. It is a caller's decision rather than a second
   * function because the transport, the retry behaviour and the "never
   * throws" guarantee are identical either way; only the envelope differs.
   */
  to?: string[];
}

/** Which transport is in use. Exported for the check script and the logs. */
export type MailProvider = "resend" | "smtp" | "none";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/* Split on commas so several people can be notified from one variable. */
const recipients = (env.MAIL_TO ?? "")
  .split(",")
  .map((a) => a.trim())
  .filter(Boolean);

/**
 * The address mail is sent as. Never the enquirer's own address, however
 * convenient that would be for hitting Reply: sending as a domain we are not
 * authorised for is what SPF and DMARC exist to reject, and it is the fastest
 * way to have everything we send treated as spam. The enquirer goes in
 * Reply-To instead.
 *
 * With Resend this must be on a domain verified in the Resend dashboard, or
 * the API rejects the send outright — which is the good failure mode, since
 * it happens at us rather than silently in somebody's spam folder.
 */
const from = env.MAIL_FROM || env.MAIL_USER || "";

const smtpReady = Boolean(env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS);

/**
 * A transport is only usable when we also know who to write to and who to
 * write as. Anything less and there is nothing to attempt.
 */
const provider: MailProvider =
  !recipients.length || !from
    ? "none"
    : env.RESEND_API_KEY
      ? "resend"
      : smtpReady
        ? "smtp"
        : "none";

export const mailConfigured = provider !== "none";

/**
 * Built once, on first use, and then reused — nodemailer pools the connection
 * and rebuilding it per message would mean a fresh TLS handshake every time.
 * Lazy rather than at import so that a server using Resend, or with no mail
 * configured at all, never constructs one.
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

/** Keeps a stored reason readable in the admin, whatever the API returned. */
const trim = (value: unknown): string => {
  const text = value instanceof Error ? value.message : String(value);
  return text.slice(0, 300);
};

/**
 * One POST to Resend.
 *
 * AbortSignal.timeout rather than trusting the network: fetch has no default
 * timeout, so without this a hung connection would keep the promise — and the
 * inquiry's notification record — pending for as long as the process lived.
 */
async function sendViaResend(
  message: MailMessage,
  to: string[]
): Promise<MailResult> {
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        /* Resend spells it reply_to. Omitted entirely rather than sent as
           null, which the API rejects. */
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      /* Resend answers errors as JSON with a `message`, but a proxy or an
         outage can put HTML in front of it — so the body is read as text and
         only then tried as JSON. Reading it blind as JSON would throw here
         and turn a clear "domain not verified" into "Unexpected token <". */
      const body = await response.text().catch(() => "");
      let detail = body.slice(0, 200);
      try {
        const parsed = JSON.parse(body) as { message?: string; name?: string };
        if (parsed?.message) detail = parsed.message;
      } catch {
        /* Not JSON. The raw opening of the body is the best we have. */
      }
      const reason = `Resend ${response.status}${detail ? `: ${detail}` : ""}`;
      console.error("[mail] Send failed:", reason);
      return { ok: false, reason: trim(reason) };
    }

    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    const reason = trim(err);
    console.error("[mail] Send failed:", reason);
    return { ok: false, reason };
  }
}

async function sendViaSmtp(
  message: MailMessage,
  to: string[]
): Promise<MailResult> {
  try {
    const info = await getTransport().sendMail({
      from,
      to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    const reason = trim(err);
    console.error("[mail] Send failed:", reason);
    /* Trimmed: this is stored on the inquiry document and shown in the
       admin, and some SMTP servers reply with a wall of diagnostics. */
    return { ok: false, reason };
  }
}

/* Logged once rather than per message: an unconfigured server would otherwise
   print a line for every form submission it ever receives. */
let warnedUnconfigured = false;

export const mailService = {
  configured: mailConfigured,
  provider,
  recipients,
  from,

  /**
   * Sends to MAIL_TO, or to `message.to` when the caller names someone.
   * Resolves either way — see the rule at the top of this file. Callers
   * record the result; they never branch on an exception.
   */
  async send(message: MailMessage): Promise<MailResult> {
    if (provider === "none") {
      if (!warnedUnconfigured) {
        warnedUnconfigured = true;
        console.warn(
          "[mail] Not configured — set RESEND_API_KEY (or MAIL_HOST, " +
            "MAIL_USER and MAIL_PASS), plus MAIL_FROM and MAIL_TO, to turn " +
            "on inquiry notifications. Inquiries are still being saved and " +
            "are visible in the admin dashboard."
        );
      }
      return { ok: false, reason: "Mail is not configured on the server" };
    }

    const to = message.to?.length ? message.to : recipients;
    /* Nobody to write to is not an error worth a network round trip. It is
       the ordinary case for the acknowledgement when a call-back request
       left a phone number and no address. */
    if (!to.length) return { ok: false, reason: "No recipient" };

    return provider === "resend"
      ? sendViaResend(message, to)
      : sendViaSmtp(message, to);
  },

  /**
   * Checks the credentials without sending anything — for confirming a
   * deploy rather than finding out from the first student who fills in a
   * form. Never throws.
   *
   * For SMTP this opens a connection and authenticates. For Resend there is
   * no connection to open, so it asks the API a harmless authenticated
   * question instead: listing domains proves the key is real and current,
   * and 401 versus 403 versus a network error are all distinguishable.
   */
  async verify(): Promise<MailResult> {
    if (provider === "none") {
      return { ok: false, reason: "Mail is not configured on the server" };
    }

    if (provider === "smtp") {
      try {
        await getTransport().verify();
        return { ok: true };
      } catch (err) {
        return { ok: false, reason: trim(err) };
      }
    }

    try {
      const response = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return { ok: true };
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        reason: trim(
          `Resend ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`
        ),
      };
    } catch (err) {
      return { ok: false, reason: trim(err) };
    }
  },
};
