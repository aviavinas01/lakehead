import { env } from "./env.js";
import { User } from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";

/**
 * The one admin account, guaranteed to exist, every time the server starts.
 *
 * ------------------------------------------------------------------
 * WHY THIS RUNS AT BOOT AND NOT FROM A COMMAND. It used to be `npm run
 * seed:admin`, run by hand. That works on a laptop and cannot work on Render
 * at all: the script is TypeScript run through `tsx`, a devDependency that
 * production installs skip, while the service runs compiled `dist/`. So the
 * deployment had a required manual step that could not be performed on the
 * machine that needed it — and the failure was invisible, because a database
 * with no admin in it answers a correct password with "invalid email or
 * password", exactly like a wrong one.
 *
 * The environment names the admin; the server is what makes it true.
 * ------------------------------------------------------------------
 *
 * ADMIN_PASSWORD IS AUTHORITATIVE. Change it in the dashboard, redeploy, and
 * that is the new password — which also makes this the only way back in
 * after a lockout or a forgotten password, since there is no reset email and
 * no second account to grant one. The value therefore lives in the host's
 * environment in the clear, and should be treated as the credential it is.
 *
 * It is idempotent and it never creates a second account: an unchanged
 * password writes nothing at all, so an ordinary restart costs one indexed
 * lookup and one bcrypt compare.
 */
/**
 * What happened last time this ran, for /api/health to report.
 *
 * "missing" until it has been proved otherwise, so a server that crashed
 * before reaching the check never claims to be ready.
 */
export type AdminState = "missing" | "ready" | "failed";
let state: AdminState = "missing";
export const adminState = (): AdminState => state;

export const ensureAdmin = async (): Promise<void> => {
  try {
    await run();
    state = "ready";
  } catch (err) {
    state = "failed";
    throw err;
  }
};

const run = async (): Promise<void> => {
  /* The schema lowercases and trims on write, so the stored address is
     already normalised — match it, or a capitalised dashboard value would
     look like a different account and create a duplicate. This is also the
     exact form auth.service compares a sign-in against. */
  const email = env.ADMIN_EMAIL.trim().toLowerCase();

  const existing = await User.findOne({ email }).select(
    "+password +failedLogins +lockedUntil"
  );

  if (!existing) {
    await User.create({
      name: "Admin",
      email,
      password: await hashPassword(env.ADMIN_PASSWORD),
      role: "admin",
    });
    console.log(`[admin] created ${email}`);
    return;
  }

  const patch: Record<string, unknown> = {};

  /* Compared rather than rehashed and overwritten: bcrypt salts every hash,
     so the stored value differs from a fresh one even when the password is
     identical, and writing on every boot would tell us nothing and hide when
     something really did change. */
  if (!(await comparePassword(env.ADMIN_PASSWORD, existing.password))) {
    patch.password = await hashPassword(env.ADMIN_PASSWORD);
    /* A deliberate password change is also the operator saying "let me back
       in", so it lifts any lockout. Restarts alone must NOT — otherwise the
       lockout lasts only until the next deploy. */
    patch.failedLogins = 0;
    patch.lockedUntil = undefined;
  }

  /* Drift repair. Neither should ever happen through the app — there is no
     route that demotes or disables this account — but if one did, the only
     account that can sign in would be locked out of its own dashboard with
     no way to undo it. */
  if (existing.role !== "admin") patch.role = "admin";
  if (!existing.active) patch.active = true;

  if (Object.keys(patch).length === 0) {
    console.log(`[admin] ${email} present and unchanged`);
    return;
  }

  const { lockedUntil, ...set } = patch;
  await User.updateOne(
    { _id: existing._id },
    lockedUntil === undefined && "lockedUntil" in patch
      ? { $set: set, $unset: { lockedUntil: 1 } }
      : { $set: set }
  );
  console.log(`[admin] updated ${email} (${Object.keys(patch).join(", ")})`);
};
