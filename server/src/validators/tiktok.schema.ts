import { z } from "zod";
import { TIKTOK_CATEGORIES } from "../models/TikTok.js";

/* The URL is the only thing a person types. Everything else about a clip is
   TikTok's own answer to an oEmbed lookup — see tiktok.service. */
export const createTikTokSchema = z.object({
  body: z.object({
    url: z.string().trim().min(10).max(500),
    category: z.enum(TIKTOK_CATEGORIES).optional(),
  }),
});

/* Title, so a clip can be renamed for the site; published and order, so the
   row can be curated. The URL is not editable — a different video is a
   different clip, and editing it in place would leave the cached videoId,
   thumbnail and author describing the old one. */
export const updateTikTokSchema = z.object({
  body: z.object({
    title: z.string().trim().max(300).optional(),
    category: z.enum(TIKTOK_CATEGORIES).optional(),
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
