/**
 * A client-side note of when the gate pass runs out.
 *
 * IT IS NOT THE PASS AND IT GRANTS NOTHING. The pass is an httpOnly cookie
 * the browser cannot read, issued and checked entirely on the server. This is
 * a timestamp in sessionStorage; forging it does precisely nothing, because
 * the server still refuses a sign-in without the real cookie.
 *
 * WHAT IT BUYS is the one thing the server deliberately will not say. Every
 * sign-in failure answers "Invalid email or password" — including "you never
 * opened the door" and "your pass ran out while you were typing". So the
 * admin, who has done nothing wrong, is told their password is wrong and
 * spends the evening checking their password. gate.ts explains why there is
 * no "is the door open?" endpoint: it would let an attacker test a stolen
 * pass without spending a sign-in attempt. This reaches the same answer
 * without asking the server anything at all.
 *
 * IT IS ADVISORY, NEVER A GATE. sessionStorage throws in some private modes
 * and comes back empty in others, so a missing mark means "probably not" and
 * not "certainly not". Nothing here may ever disable the form — the server
 * is the authority, and a false negative that blocked a legitimate admin
 * would be a worse bug than the one this fixes.
 */

/** Must match PASS_MS in server/src/middleware/gate.ts. Keep them in step. */
const PASS_MS = 10 * 60 * 1000;

const KEY = "lh.pass";

/** Called when the door has just been opened. */
export const markPass = (): void => {
  try {
    sessionStorage.setItem(KEY, String(Date.now() + PASS_MS));
  } catch {
    /* Private mode, or storage disabled. The pass itself is unaffected. */
  }
};

/** Called once the pass has been spent on a successful sign-in. */
export const clearPassMark = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

/** Milliseconds left on the pass, or 0 if there is none or it has run out. */
export const passLeft = (): number => {
  try {
    const until = Number(sessionStorage.getItem(KEY));
    return Number.isFinite(until) && until > Date.now() ? until - Date.now() : 0;
  } catch {
    return 0;
  }
};
