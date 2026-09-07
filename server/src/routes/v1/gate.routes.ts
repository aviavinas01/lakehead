import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { codeMatches, grantPass } from "../../middleware/gate.js";
import { gateLimiter } from "../../middleware/rateLimiters.js";
import { ApiError } from "../../utils/ApiError.js";

const router = Router();

/**
 * The hidden door's only endpoint.
 *
 * Deliberately says nothing on success beyond "ok" — no redirect target, no
 * hint about what was opened. The client already knows where it is going;
 * anyone else learns nothing from the response body.
 *
 * There is no matching "is the door open?" endpoint on purpose. One would let
 * an attacker test a stolen pass without spending a sign-in attempt.
 */
router.post(
  "/",
  gateLimiter,
  asyncHandler(async (req, res) => {
    if (!codeMatches((req.body as { code?: unknown })?.code)) {
      throw ApiError.unauthorized("That did not work.");
    }
    grantPass(res);
    res.json({ ok: true });
  })
);

export default router;
