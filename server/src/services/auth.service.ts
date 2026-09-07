import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/User.js";
import { randomBytes } from "node:crypto";
import { comparePassword, hashPassword } from "../utils/password.js";
import { ApiError, newRef } from "../utils/ApiError.js";

/**
 * Failures before an account stops answering, and for how long.
 *
 * This sits UNDER the rate limiter on the route, not instead of it. That one
 * counts attempts from an address and is the right shape for a script
 * hammering from one machine. This one counts attempts against an ACCOUNT,
 * which is the shape that survives being spread across a botnet — the case
 * the limiter cannot see at all, because no single address ever looks busy.
 */
const MAX_FAILURES = 8;
const LOCK_MS = 15 * 60 * 1000;

/**
 * A bcrypt hash of nothing in particular, compared against when there is no
 * account to compare against — see the call site.
 *
 * Generated once at module load rather than written down as a literal: a
 * hard-coded hash in a repository is a hash somebody will eventually try to
 * crack, find it decodes to "dummy", and reasonably wonder what else in here
 * is decorative.
 */
const DECOY = hashPassword(randomBytes(24).toString("hex"));

const burnTime = async () => {
  await comparePassword("x", await DECOY);
};

export const authService = {
  async login(email: string, password: string): Promise<{ user: UserDocument; token: string }> {
    const user = await User.findOne({ email }).select("+password +failedLogins +lockedUntil");

    /* THE SAME ANSWER FOR EVERY KIND OF FAILURE — no account, wrong
       password, disabled, locked. Telling them apart is telling an attacker
       which addresses are real, and that is most of the work of an attack.
       The lock is enforced silently for the same reason: a caller learns
       nothing about whether they are close. */
    /* THE CALLER ALWAYS GETS THE SAME SENTENCE. Telling "no such account"
       apart from "wrong password" apart from "locked" is telling an attacker
       which addresses are real and how close they are, and that is most of
       the work of an attack.

       THE SERVER LOG DOES NOT HAVE TO BE COY. Six separate checks reach this
       one message, so without a note of which fired, a genuine sign-in
       problem is unfalsifiable from the outside — the operator sees exactly
       what an attacker sees. The reason goes to stdout, where only somebody
       with access to the host can read it, and the password never does. */
    const wrong = (reason: string) => {
      const ref = newRef();
      console.warn(`[auth] ref=${ref} sign-in refused (${reason}) for ${email}`);
      return ApiError.unauthorized("Invalid email or password", ref);
    };

    /* ONE ACCOUNT. Not "any admin" — this exact address, the one set in the
       environment at deploy. There is no route left that can create a
       second, so this is belt and braces; but it is the check that would
       still hold if somebody wrote a document straight into the database. */
    if (email.trim().toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      await burnTime();
      throw wrong("not the configured ADMIN_EMAIL");
    }

    if (!user || !user.active || user.role !== "admin") {
      /* A REAL COMPARISON AGAINST NOTHING, so the clock says the same thing
         either way. bcrypt at cost 12 takes a couple of hundred milliseconds;
         returning early when no account exists made a missing address answer
         almost instantly and a real one answer slowly. That difference is
         readable over a handful of requests, and it turns the login form
         into a way to test whether an address is registered — which is the
         first half of an attack on the account behind it. */
      await burnTime();
      throw wrong(
        !user ? "no such account" : !user.active ? "account disabled" : "not an admin"
      );
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw wrong(
        `locked for another ${Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)} min`
      );
    }

    if (!(await comparePassword(password, user.password))) {
      /* Counted with an atomic update rather than a read-modify-write on the
         document: several attempts land at once during an attack, which is
         exactly when a lost increment matters most. */
      const failures = (user.failedLogins ?? 0) + 1;
      await User.updateOne(
        { _id: user._id },
        failures >= MAX_FAILURES
          ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) }
          : { $inc: { failedLogins: 1 } }
      );
      throw wrong(`wrong password (${failures} in a row)`);
    }

    /* A good password clears the slate. Only written when there is something
       to clear, so an ordinary sign-in costs no extra write. */
    if (user.failedLogins || user.lockedUntil) {
      await User.updateOne(
        { _id: user._id },
        { failedLogins: 0, $unset: { lockedUntil: 1 } }
      );
    }
    const token = jwt.sign({ id: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    return { user, token };
  },
};
