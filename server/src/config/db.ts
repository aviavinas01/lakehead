import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * The database connection.
 *
 * ------------------------------------------------------------------
 * IT RETRIES RATHER THAN GIVING UP ON THE FIRST REFUSAL.
 *
 * This used to be a single `connect()` with `process.exit(1)` in the catch.
 * On a platform that restarts a dead process, that turns a ten-second Atlas
 * blip — a failover, a brief network partition, a paused free-tier cluster
 * waking up — into a crash loop: the process dies, the platform restarts it,
 * it dies again, and each cycle costs a cold start. The site is down for as
 * long as the blip lasts plus however long the restarts take to settle.
 *
 * Retrying with a growing delay rides out exactly that case, and still exits
 * if the database is genuinely unreachable — a wrong connection string or a
 * missing IP allowance should fail loudly and quickly rather than leaving a
 * server up that cannot answer anything.
 *
 * ONCE CONNECTED, MONGOOSE HANDLES RECONNECTION ITSELF. The driver buffers
 * commands and re-establishes the connection on its own, so this is only
 * about the first connection at boot. The listeners below exist so that a
 * drop is visible in the logs rather than being inferred from a burst of
 * slow requests.
 * ------------------------------------------------------------------
 */

/** Attempts before giving up. Roughly 30 seconds in total with the backoff
    below — long enough for a failover, short enough that a genuinely wrong
    configuration is obvious quickly. */
const MAX_ATTEMPTS = 6;

const delayFor = (attempt: number) => Math.min(1000 * 2 ** (attempt - 1), 10_000);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Connection options.
 *
 * `serverSelectionTimeoutMS` is the important one: the driver's default is 30
 * seconds, which means a request made while the database is unreachable hangs
 * for half a minute before failing. Ten seconds fails fast enough that a
 * caller gets an error rather than a timeout, and is still far longer than a
 * healthy selection takes.
 *
 * The pool is sized for a single small instance. The driver's default maximum
 * is 100, which for this workload is not a limit so much as permission to
 * open a hundred connections against an Atlas tier that allows far fewer.
 */
const OPTIONS = {
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 20,
  minPoolSize: 2,
  /* Retries a failed read/write once on a transient network error, which is
     what makes a failover invisible to a request in flight. */
  retryWrites: true,
  retryReads: true,
} as const;

let listening = false;

/** Logs connection loss and recovery. Registered once. */
function watch(): void {
  if (listening) return;
  listening = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected — the driver will keep retrying");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("[db] reconnected");
  });
  mongoose.connection.on("error", (err: Error) => {
    /* Not fatal: an error after the initial connection is the driver's to
       recover from, and killing the process would turn a recoverable blip
       into an outage. Logged so it is visible. */
    console.error("[db] connection error:", err.message);
  });
}

export const connectDB = async (): Promise<void> => {
  watch();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(env.MONGO_URI, OPTIONS);
      console.log("MongoDB connected");
      return;
    } catch (err) {
      const message = (err as Error).message;

      if (attempt === MAX_ATTEMPTS) {
        console.error(
          `MongoDB connection failed after ${MAX_ATTEMPTS} attempts:`,
          message
        );
        process.exit(1);
      }

      const pause = delayFor(attempt);
      console.warn(
        `[db] attempt ${attempt}/${MAX_ATTEMPTS} failed (${message}) — retrying in ${pause}ms`
      );
      await wait(pause);
    }
  }
};

export const disconnectDB = () => mongoose.disconnect();
