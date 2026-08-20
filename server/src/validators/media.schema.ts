import { z } from "zod";

// Multipart form fields arrive as strings — coerce where needed.
export const uploadMediaSchema = z.object({
  body: z.object({
    title: z.string().trim().max(200).optional(),
    caption: z.string().max(500).optional(),
    album: z.string().length(24).optional(),
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
