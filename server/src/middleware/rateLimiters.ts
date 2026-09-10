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
