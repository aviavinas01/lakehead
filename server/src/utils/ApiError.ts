import { randomBytes } from "node:crypto";

/**
 * A short, meaningless id printed in the log AND handed to the caller.
 *
 * The sign-in endpoint answers every kind of failure with one sentence on
 * purpose — telling "no such account" from "wrong password" apart is telling
 * an attacker which addresses are real. The cost is that a genuine problem
 * is unfalsifiable from the outside: the operator sees exactly what an
 * attacker sees, which is nothing.
 *
 * A reference breaks that tie without giving anything away. It is random, it
 * means nothing on its own, and it cannot be worked backwards into a reason.
 * But it appears in the browser and in the server log, so "I got ref 4b1e9c"
 * finds the one line that says why.
 */
export const newRef = () => randomBytes(3).toString("hex");

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    /** Optional; see newRef. Echoed to the caller by the error handler. */
    public ref?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(msg = "Bad request", ref?: string) { return new ApiError(400, msg, ref); }
  static unauthorized(msg = "Not authenticated", ref?: string) { return new ApiError(401, msg, ref); }
  static forbidden(msg = "Forbidden", ref?: string) { return new ApiError(403, msg, ref); }
  static notFound(msg = "Not found", ref?: string) { return new ApiError(404, msg, ref); }
  static conflict(msg = "Conflict", ref?: string) { return new ApiError(409, msg, ref); }
  /* Something WE depend on failed, rather than something the caller did.
     Without this such a failure falls through to the 500 handler and is
     reported as "Internal server error" with a stack trace — which blames
     us for an outage at YouTube and tells the admin nothing they can act on. */
  static badGateway(msg = "An upstream service did not answer", ref?: string) { return new ApiError(502, msg, ref); }
}
