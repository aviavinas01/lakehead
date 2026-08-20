import { z } from "zod";

export const createAlbumSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().max(1000).optional(),
    coverImage: z.string().optional(),
    published: z.boolean().default(false),
    order: z.number().int().default(0),
  }),
});

export const updateAlbumSchema = z.object({
  body: createAlbumSchema.shape.body.partial(),
  params: z.object({ id: z.string().length(24) }),
});
