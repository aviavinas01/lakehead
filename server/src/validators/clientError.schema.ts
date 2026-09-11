import { z } from "zod";

/**
 * A crash report from a visitor's browser.
 *
 * Every field is capped hard. This endpoint is public and unauthenticated by
 * necessity — a page that has crashed cannot be relied on to be signed in, or
 * to be an admin — so everything it accepts is bounded, nothing it accepts is
 * stored, and nothing it accepts is echoed back.
 */
export const clientErrorSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(300),
    /* Long enough for a useful stack, short enough that the log cannot be
       filled by one request. */
    stack: z.string().trim().max(4000).optional(),
    /* Where it happened. A path, not a full URL — the host is ours anyway
       and a query string could carry something personal. */
    path: z.string().trim().max(200).optional(),
  }),
});
