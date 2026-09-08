import { z } from "zod";

/* See the notes in event.schema for why "" is handled explicitly and why the
   protocol is checked — this string ends up in an href on the public site,
   and `javascript:...` is a valid URL. */
const optionalImage = z
  .string()
  .trim()
  .max(800)
  .refine(
    (v) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//i.test(v),
    "Must be an uploaded file or an http(s) URL"
  )
  .optional()
  .transform((v) => (v ? v : null));

const optionalDate = z
  .union([z.coerce.date(), z.literal("")])
  .optional()
  .transform((v) => (v instanceof Date ? v : null));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

/* REQUIRED, unlike everywhere else a URL appears here: a news item with no
   link is a card that cannot be clicked, which is the only thing it is for. */
const articleUrl = z
  .string()
  .trim()
  .min(8)
  .max(800)
  .refine((v) => /^https?:\/\//i.test(v), "Must start with http:// or https://");

export const createNewsSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(250),
    url: articleUrl,
    image: optionalImage,
    summary: z.string().trim().min(2).max(1000),
    source: optionalText(120),
    publishedAt: optionalDate,
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

export const updateNewsSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(250).optional(),
    url: articleUrl.optional(),
    image: optionalImage,
    summary: z.string().trim().min(2).max(1000).optional(),
    source: optionalText(120),
    publishedAt: optionalDate,
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
