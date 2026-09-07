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
