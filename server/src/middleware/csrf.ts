import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

/**
 * Cross-site request forgery, closed off.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS NEEDED HERE SPECIFICALLY.
 *
 * The session is a cookie, and in production that cookie is
 * `sameSite: "none"` — it has to be, because the client and the API are
 * deployed to different origins and the browser would otherwise drop it. But
 * "none" means exactly what it says: the browser attaches that cookie to
 * requests from ANY site, including a page an admin happens to open in
 * another tab.
 *
 * So a form on an attacker's page, posting to this API, arrives fully
 * authenticated. Nothing above this middleware would notice: the cookie is
 * genuine, the JWT verifies, the user is real and active. Every mutating
 * endpoint on the site — delete a post, add a user, wipe the gallery — is
 * reachable that way.
 *
 * HOW THIS STOPS IT. A cross-site HTML form can post to any URL, but it
 * cannot set a request header. Anything that CAN set one — fetch, XHR — is
 * forced by the browser into a CORS preflight first, and the preflight is
 * answered by the `cors()` middleware, which only allows CLIENT_URL. So
 * requiring one header that only our own client sends is enough: forms
 * cannot forge it, and scripts cannot get past CORS to send it.
 *
 * This is the "custom request header" defence, and it is only sound while
 * the CORS origin stays a real allow-list. IF ANYONE EVER SETS
 * `cors({ origin: true })` OR `"*"` HERE, THIS PROTECTION IS GONE and a
 * token-based scheme has to replace it.
 * ------------------------------------------------------------------
 *
 * GET, HEAD and OPTIONS are exempt: they are not supposed to change
 * anything, and exempting them keeps ordinary links, images and the
 * preflight itself working.
 */

const HEADER = "x-requested-by";
const EXPECTED = "lakehead-admin";

/** Methods that can change state, and therefore have something to forge. */
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const csrfGuard: RequestHandler = (req, _res, next) => {
  if (!MUTATING.has(req.method)) return next();

  if (req.get(HEADER) !== EXPECTED) {
    /* Deliberately vague to the caller and specific in the logs: a forged
       request should learn nothing, and a developer who has just added a
       fetch by hand should be able to find out why it failed. */
    return next(
      ApiError.forbidden(
        "This request was blocked. Refresh the page and try again."
      )
    );
  }
  next();
};
