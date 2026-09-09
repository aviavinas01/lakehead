import { z } from "zod";

/* See the notes in news.schema for why "" is handled explicitly and why the
   protocol is checked — this string ends up in an <img src> on the public
   site, and `javascript:...` is a valid URL. */
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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

/**
 * The director's message. There is no create/update pair because there is no
 * create: the record is a singleton and the service upserts it, so this is
 * the whole shape every time it is saved.
 */
export const saveDirectorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    title: z.string().trim().min(2).max(160),
    photo: optionalImage,
    lead: optionalText(700),
    statement: z.string().trim().min(2).max(20000),
    published: z.boolean().optional(),
  }),
});

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    title: z.string().trim().min(2).max(160),
    photo: optionalImage,
    quote: optionalText(600),
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    title: z.string().trim().min(2).max(160).optional(),
    photo: optionalImage,
    quote: optionalText(600),
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
