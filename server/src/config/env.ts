import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  /**
   * Where uploaded media is written and served from.
   *
   * OPTIONAL, and unset is the normal case — it defaults to <server>/uploads,
   * which is what render.yaml mounts its disk over. It exists because when
   * that mount is wrong, the symptom is silent: the server writes happily to
   * an ordinary folder, serves the file for the rest of that container's
   * life, and loses every byte on the next deploy. Being able to repoint the
   * directory from the dashboard turns a redeploy-and-hope into one setting.
   *
   * /api/health reports the resolved path and whether it is writable.
   */
  UPLOADS_DIR: z.string().min(1).optional(),
  /**
   * Cloudinary, for uploaded media.
   *
   * ALL THREE OR NONE. With them set, uploads go to Cloudinary and are
   * CDN-served; with them unset the server writes to UPLOADS_DIR exactly as
   * it always has. Half-configured is treated as unconfigured rather than as
   * an error — see usingCloudinary in services/storage.service — so a
   * partially-filled dashboard degrades to the local disk instead of
   * refusing every upload.
   */
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  /**
   * A separate secret for the footer gate's short-lived pass.
   *
   * OPTIONAL, falling back to JWT_SECRET so nothing breaks if it is unset —
   * which is how it shipped, and is still safe: a gate pass carries no `id`,
   * so `protect` looks up `User.findById(undefined)`, finds nothing, and
   * refuses. There is no escalation path either way.
   *
   * Setting it is defence in depth. Two tokens signed with one key means one
   * leaked key is two compromises, and the gate token is the one handed out
   * to anybody who types a code into a public page. Set it and the two
   * become independent.
   *
   * Changing it invalidates outstanding passes, which live ten minutes.
   */
  GATE_SECRET: z.string().min(32).optional(),
  CLIENT_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  /* The code typed into the footer's hidden door. Twelve characters minimum
     because it is guessable in a way a password is not — it is short, it is
     shared, and it is typed in front of people. It is a second lock, never a
     replacement for the first. */
  ADMIN_GATE_CODE: z.string().min(12, "ADMIN_GATE_CODE must be at least 12 characters"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  /* Set by Render automatically on every deploy — we never write it. It is
     reported by /api/health so that "is the code I just pushed actually the
     code running?" is a question with an answer. Without it, a deploy that
     silently failed and left the previous build serving looks exactly like a
     deploy that worked, and every symptom gets debugged against source that
     is not running. */
  RENDER_GIT_COMMIT: z.string().optional(),
  /* Optional: without these the footer falls back to its static rating */
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_PLACE_ID: z.string().optional(),
  /* Optional: where the home page's Success Stories videos come from.
     Set ONE of these — the playlist wins if both are present. Without
     either, that row falls back to the "Student Reviews" media album.
       YOUTUBE_PLAYLIST_ID  a playlist you curate, id starts "PL"
       YOUTUBE_CHANNEL_ID   the channel's latest uploads, id starts "UC" */
  YOUTUBE_PLAYLIST_ID: z.string().optional(),
  YOUTUBE_CHANNEL_ID: z.string().optional(),
  /* A second, separate playlist for the student testimonial row on the
     Study Abroad page. Leave it unset and that row simply does not render. */
  YOUTUBE_TESTIMONIALS_PLAYLIST_ID: z.string().optional(),

  /* Outgoing mail — the notification a counsellor gets when someone fills in
     a form. EVERY ONE OF THESE IS OPTIONAL, and deliberately so: a failure in
     this schema calls process.exit(1) below, so one required mail variable
     would take the whole API down the moment it was deployed without the
     dashboard being filled in first. Unset, mail.service.ts reports itself
     unconfigured and the site behaves exactly as it did before — inquiries
     are still saved and still reach the dashboard.

     MAIL_HOST    smtp.gmail.com, mail.yourhost.com, …
     MAIL_PORT    587 for STARTTLS (the usual choice), 465 for implicit TLS.
                  Never 25 — cloud providers block outbound 25 as spam control.
     MAIL_SECURE  "true" only for 465. On 587 this must be false: the socket
                  starts in the clear and STARTTLS upgrades it.
     MAIL_USER    the full mailbox address to log in as
     MAIL_PASS    for Google Workspace this is an App Password generated with
                  2FA on, NOT the account password
     MAIL_FROM    what recipients see. Must be a mailbox on a domain we are
                  allowed to send as, or SPF/DMARC will reject it. Defaults
                  to MAIL_USER.
     MAIL_TO      who gets notified. Comma-separated for several people.
                  Used by BOTH transports — it is who to write to, not how. */
  /* RESEND — the preferred transport, and the one that wins when set.
     A single API key over HTTPS: no SMTP port to be blocked or throttled,
     and failures come back as a sentence rather than an SMTP transcript.
     Unset, the MAIL_* variables below are used exactly as before, so this
     is purely additive — see services/mail.service.ts. */
  RESEND_API_KEY: z.string().optional(),
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_SECURE: z.enum(["true", "false"]).default("false"),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_TO: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
