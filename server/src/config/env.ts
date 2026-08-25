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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
