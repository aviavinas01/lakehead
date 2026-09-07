import { createHash, timingSafeEqual } from "node:crypto";
import type { CookieOptions, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * The door in front of the door.
 *
 * ------------------------------------------------------------------
 * WHAT THIS IS, HONESTLY. Hiding the sign-in page is obscurity, and obscurity
 * is not what keeps anybody out — the password is. What this adds that is
 * worth having is the middleware at the bottom of this file: `POST
 * /auth/login` is not merely hidden, it is UNREACHABLE without a pass. So a
 * credential-stuffing bot never reaches the password check at all, and an
 * attacker needs two secrets rather than one.
 *
 * The code is compared HERE and never leaves the server. A code checked in
 * the browser is a code sitting in the JavaScript bundle for anyone who
 * opens devtools, which would make the whole exercise theatre.
 * ------------------------------------------------------------------
 *
 * THE PASS IS A SHORT-LIVED JWT IN AN httpOnly COOKIE. A cookie rather than a
 * value the page holds, because the page must not be able to read, copy or
 * forge it; short-lived because it exists only to carry somebody from the
 * footer to the sign-in form, and a pass good for a week would be a second
 * password that never expires.
 */

/** How long a pass is good for — long enough to type an email and password. */
const PASS_MS = 10 * 60 * 1000;

const COOKIE = "gate";

const passOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  /* Matches the session cookie: the client and API are separate origins in
     production, and a `lax` cookie would never be sent at all. */
  sameSite: isProd ? "none" : "lax",
  maxAge: PASS_MS,
};

/**
 * Constant-time comparison of two strings of any length.
 *
 * `timingSafeEqual` requires equal-length buffers and throws otherwise —
 * and the length check itself would leak the length of the real code. Both
 * sides are hashed first so the comparison is always over 32 bytes, whatever
 * was submitted.
 */
function sameSecret(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** True if the submitted code is the configured one. */
export const codeMatches = (code: unknown): boolean =>
  typeof code === "string" && sameSecret(code, env.ADMIN_GATE_CODE);

/** Issue a pass. */
export const grantPass = (res: import("express").Response): void => {
  const token = jwt.sign({ gate: true }, env.JWT_SECRET, {
    expiresIn: Math.floor(PASS_MS / 1000),
  });
  res.cookie(COOKIE, token, passOptions);
};

/** Spend it. Called once the sign-in it was issued for has succeeded. */
export const clearPass = (res: import("express").Response): void => {
  res.clearCookie(COOKIE, { ...passOptions, maxAge: 0 });
};

/**
 * THE PART THAT ACTUALLY DOES SOMETHING. Put in front of the sign-in route,
 * this makes the password endpoint unreachable to anyone who has not been
 * through the door first.
 *
 * It answers 401 rather than 403, and with the same wording the sign-in
 * itself uses on failure — a probe should not be able to tell "you have not
 * opened the door" from "that password is wrong", because the difference
 * tells it the door exists.
 */
export const requirePass: RequestHandler = (req, _res, next) => {
  const token: string | undefined = req.cookies?.[COOKIE];
  if (!token) return next(ApiError.unauthorized("Invalid email or password"));
  try {
    jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid email or password"));
  }
};
