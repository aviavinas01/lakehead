import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
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
     MAIL_TO      who gets notified. Comma-separated for several people. */
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
