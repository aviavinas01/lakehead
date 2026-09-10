import { z } from "zod";

/**
 * A partner institution. See models/University.ts for what the record is.
 *
 * The two URL shapes below are separate on purpose, and the difference is a
 * security one rather than a tidiness one — see the notes in news.schema and
 * event.schema. `logo` may be an upload OR an external address because that
 * is what the admin's image picker produces; `website` and every entry in
 * `links` must be http(s), because `javascript:...` is a perfectly valid URL
 * and these end up in an href on a public page.
 *
 * `slug` is absent from both schemas, deliberately. It is derived from the
 * name by the service and is never accepted from a client — a caller that
 * could choose its own slug could take an address that belongs to another
 * record, or one that collides with a route.
 */

/* "" is handled explicitly and normalised to null, not undefined: JSON
   cannot send undefined, so an emptied box and an untouched one would
   otherwise arrive identical and a saved value could never be cleared. See
   server/src/utils/patch.ts. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const optionalWebUrl = z
  .string()
  .trim()
  .max(800)
  .refine(
    (v) => v === "" || /^https?:\/\//i.test(v),
    "Must start with http:// or https://"
  )
  .optional()
  .transform((v) => (v ? v : null));

/* REQUIRED, unlike the optional images elsewhere: the partner wall is a wall
   of marks, and a record with no logo has nothing to show on it. */
const logo = z
  .string()
  .trim()
  .min(1)
  .max(800)
  .refine(
    (v) => v.startsWith("/uploads/") || /^https?:\/\//i.test(v),
    "Must be an uploaded file or an http(s) URL"
  );

/* Capped at a sane length rather than left open: these are months, and a
   list of forty of them is a paste accident, not an intake calendar. */
const intakes = z
  .array(z.string().trim().min(1).max(40))
  .max(24)
  .optional();

const links = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(80),
      url: z
        .string()
        .trim()
        .min(8)
        .max(800)
        .refine(
          (v) => /^https?:\/\//i.test(v),
          "Must start with http:// or https://"
        ),
    })
  )
  .max(12)
  .optional();

export const createUniversitySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200),
    logo,
    country: optionalText(80),
    city: optionalText(120),
    website: optionalWebUrl,
    intakes,
    links,
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

export const updateUniversitySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200).optional(),
    logo: logo.optional(),
    country: optionalText(80),
    city: optionalText(120),
    website: optionalWebUrl,
    intakes,
    links,
    published: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
