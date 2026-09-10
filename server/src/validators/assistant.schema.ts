import { z } from "zod";

/**
 * The assistant takes one string from the public internet, so this is the
 * whole of its attack surface and the schema is correspondingly strict.
 *
 * The cap is 500 characters: long enough for anybody's real question and
 * short enough that the matcher's work stays bounded no matter what is sent.
 * Nothing here is stored, echoed back, or interpolated into anything — the
 * reply is always one of the paragraphs in data/faqs.ts, chosen by id.
 */
export const askSchema = z.object({
  body: z.object({
    question: z.string().max(500),
  }),
});

/** A suggestion chip: an entry's own id, asked for directly. */
export const suggestionSchema = z.object({
  params: z.object({
    id: z.string().max(60).regex(/^[a-z0-9-]+$/, "Not a valid id"),
  }),
});
