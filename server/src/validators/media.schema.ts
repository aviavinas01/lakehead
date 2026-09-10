import { z } from "zod";
import { ALBUM_KEYS } from "../services/managedAlbums.js";

// Multipart form fields arrive as strings — coerce where needed.
export const uploadMediaSchema = z.object({
  body: z.object({
    title: z.string().trim().max(200).optional(),
    caption: z.string().max(500).optional(),
    album: z.string().length(24).optional(),
    /* An alternative to `album` for the two albums the server manages
       itself — the client says "blogs" or "team" rather than carrying an
       id it would have to look up first. See services/managedAlbums. An
       explicit `album` id always wins. */
    albumKey: z.enum(ALBUM_KEYS).optional(),
    order: z.coerce.number().int().default(0),
  }),
});

export const updateMediaSchema = z.object({
  body: z.object({
    title: z.string().trim().max(200).optional(),
    caption: z.string().max(500).optional(),
    album: z.string().length(24).nullable().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
