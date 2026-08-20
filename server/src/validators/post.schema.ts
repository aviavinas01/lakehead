import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(200),
    excerpt: z.string().max(300).optional(),
    content: z.string().min(1),
    coverImage: z.string().url().or(z.literal("")).optional(),
    tags: z.array(z.string().trim()).max(10).default([]),
    status: z.enum(["draft", "published"]).default("draft"),
  }),
});

export const updatePostSchema = z.object({
  body: createPostSchema.shape.body.partial(),
  params: z.object({ id: z.string().length(24) }),
});
