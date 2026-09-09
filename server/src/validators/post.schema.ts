import { z } from "zod";
import { POST_PAGES } from "../models/Post.js";

/**
 * A cover image is either a full URL (someone pasted one in) or a
 * site-relative path — which is what our own uploads are: media.service
 * stores them as `/uploads/<file>`, and the client puts the API's origin
 * back in front at render time (client/src/api/media.ts).
 *
 * This used to be `.url()` alone, which quietly made it impossible to set a
 * cover image from the media library at all: every upload failed validation
 * because `/uploads/x.jpg` is not a URL. Protocol-relative `//host/x` is
 * excluded on purpose — it is a path by the letter of the rule and an
 * off-site fetch in practice.
 */
const imageRef = z
  .string()
  .refine(
    (v) => v === "" || /^https?:\/\//.test(v) || (v.startsWith("/") && !v.startsWith("//")),
    "Must be a full URL or a path beginning with /"
  );

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(200),
    excerpt: z.string().max(300).optional(),
    content: z.string().min(1),
    coverImage: imageRef.optional(),
    tags: z.array(z.string().trim()).max(10).default([]),
    /* Placement, not description — see POST_PAGES in models/Post.ts for why
       this is a closed list while `tags` above is free text. Rejecting an
       unknown key rather than storing it is the whole value of the field:
       a placement the API quietly accepted and no page ever asks for is an
       article the editor believes is published on a page it is not. */
    pages: z.array(z.enum(POST_PAGES)).max(POST_PAGES.length).default([]),
    status: z.enum(["draft", "published"]).default("draft"),
  }),
});

export const updatePostSchema = z.object({
  body: createPostSchema.shape.body.partial(),
  params: z.object({ id: z.string().length(24) }),
});
