import { z } from "zod";
import { EVENT_KINDS } from "../models/Event.js";

/**
 * An http(s) URL, or nothing.
 *
 * `""` HAS TO BE ACCEPTED SEPARATELY. A form sends every field it has, and
 * an empty text box arrives as an empty string rather than as absent — so a
 * bare `.url().optional()` rejects the perfectly ordinary act of leaving a
 * field blank. Empty is normalised to undefined so the document simply has
 * no such key.
 *
 * The protocol check is not decoration: without it `javascript:...` is a
 * valid URL, and this string ends up in an href on the public site.
 */
const optionalUrl = z
  .string()
  .trim()
  .max(800)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http:// or https://")
  .optional()
  .transform((v) => (v ? v : null));

/* An image is either one of ours (`/uploads/...`, from the media upload) or
   somebody else's absolute URL. Both are allowed; anything else is not, for
   the same reason as above. */
const optionalImage = z
  .string()
  .trim()
  .max(600)
  .refine(
    (v) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//i.test(v),
    "Must be an uploaded file or an http(s) URL"
  )
  .optional()
  .transform((v) => (v ? v : null));

/* Dates arrive as ISO strings from JSON. `coerce` turns them into Dates and
   fails loudly on nonsense rather than storing an Invalid Date. */
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

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    blurb: z.string().trim().min(2).max(2000),
    image: optionalImage,
    startsAt: optionalDate,
    when: optionalText(120),
    kind: z.enum(EVENT_KINDS).optional(),
    where: optionalText(160),
    registerUrl: optionalUrl,
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

/* Every field optional: the admin screen saves one row at a time and sends
   only what changed, so a partial body is the normal case and not a
   half-filled form. */
export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200).optional(),
    blurb: z.string().trim().min(2).max(2000).optional(),
    image: optionalImage,
    startsAt: optionalDate,
    when: optionalText(120),
    kind: z.enum(EVENT_KINDS).optional(),
    where: optionalText(160),
    registerUrl: optionalUrl,
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
