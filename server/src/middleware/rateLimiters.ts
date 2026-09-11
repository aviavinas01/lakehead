import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, try again later" },
});

/* Far tighter than the sign-in limiter, because the thing it guards is far
   weaker: one shared code, no account behind it, no lockout to fall back on.
   Five tries an hour makes guessing it impractical without making an honest
   mistyping painful. */
export const gateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  /* The same words a wrong code gets, so being throttled is indistinguishable
     from being wrong and the limit cannot be mapped by probing. */
  message: { message: "That did not work." },
});

export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
});

/**
 * The chat assistant.
 *
 * Generous compared with the others, because a real conversation is a dozen
 * questions in a few minutes and throttling that would break the feature it
 * is meant to protect. It exists to stop somebody scripting the endpoint, not
 * to ration a student who is curious — and since every reply is a fixed
 * paragraph looked up in memory, the cost of being wrong here is small.
 */
export const assistantLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "That is a lot of questions at once. Give it a minute, or message a counsellor on WhatsApp.",
  },
});

/**
 * File uploads.
 *
 * Generous, because a real session is somebody adding a gallery — thirty
 * pictures in five minutes is ordinary work, not abuse. What it stops is the
 * other case: the upload route accepts 200MB per file and is the only
 * endpoint that consumes storage, so an authenticated session left open on a
 * shared machine, or a stolen one, could fill the disk or the Cloudinary
 * quota unattended. Every other admin route is cheap to call; this one is
 * not, which is why it is the one with a limit.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "That is a lot of uploads at once. Give it a few minutes and carry on.",
  },
});

/**
 * Crash reports from browsers.
 *
 * Tight, because this endpoint is public and unauthenticated and writes to
 * the log. A genuine crash produces one report; a loop that crashes on every
 * render could produce hundreds, and so could somebody with curl. Twenty an
 * hour is far more than a real fault needs and far less than either of those
 * would send.
 */
export const clientErrorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  /* Silence rather than an explanation: nothing is reading this response. */
  message: { message: "Too many reports." },
});
