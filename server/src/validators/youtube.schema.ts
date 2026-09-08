import { z } from "zod";
import { FEEDS } from "../services/youtube.service.js";

/* One box for both kinds of address, with the caller saying which it meant.
   A URL copied while watching a video inside a playlist carries BOTH ids, so
   the address cannot decide this on its own — see the controller. */
export const createYouTubeSchema = z.object({
  body: z.object({
    url: z.string().trim().min(8).max(500),
    feed: z.enum(FEEDS).optional(),
    mode: z.enum(["video", "playlist"]).optional(),
  }),
});

/* Title, so a video can be renamed for the site; feed, published and order,
   so the rows can be curated. The URL is not editable — a different video is
   a different entry, and editing it in place would leave the stored videoId
   and channel describing the old one. */
export const updateYouTubeSchema = z.object({
  body: z.object({
    title: z.string().trim().max(300).optional(),
    feed: z.enum(FEEDS).optional(),
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
