import type { Server } from "node:http";

/**
 * How the process ends — on a deploy, on a signal, and on a bug.
 *
 * ------------------------------------------------------------------
 * THERE WAS NO HANDLER FOR ANY OF THIS, and three ordinary events had none:
 *
 *   · a rejected promise nobody awaited — Node terminates on the spot, with
 *     no context beyond the rejection itself;
 *   · an uncaught exception — same, and from anywhere: a timer, a stream, an
 *     event listener, none of which pass through asyncHandler;
 *   · SIGTERM, which is how Render ends the old process on EVERY deploy.
 *     Unhandled, it cuts requests mid-response and drops the database
 *     connection without closing it.
 *
 * The last one is not an edge case. It happened on every single deploy.
 *
 * WHY AN UNCAUGHT EXCEPTION IS FATAL rather than logged and survived. After
 * one, the process is in a state nobody reasoned about: a half-written
 * document, a pool lease that will never be returned, a request whose
 * `finally` never ran. Carrying on means serving from that state, and the
 * next symptom is not a crash — it is wrong data, quietly. Exiting hands the
 * platform something it can restart clean. A few seconds of downtime is the
 * cheaper failure, and it is the one that shows up in monitoring rather than
 * hiding.
 *
 * ONE PATH, WHICHEVER FIRED. Stop accepting connections, let what is in
 * flight finish, close the database, exit. One path means one thing to get
 * right — and the exit code is the only difference between a deploy and a
 * disaster.
 *
 * IT LIVES HERE RATHER THAN IN server.ts SO IT CAN BE TESTED. Importing
 * server.ts starts a server and connects to the real database; importing
 * this does nothing until it is called. See scripts/checkLifecycle.ts.
 * ------------------------------------------------------------------
 */

/** How long in-flight requests get before the process goes anyway. Render
    allows about 30 seconds after SIGTERM, so this stays well inside it: the
    exit is always ours rather than a SIGKILL. */
export const GRACE_MS = 10_000;

export interface LifecycleOptions {
  /** Read lazily — the handlers are installed BEFORE listen(), so that a
      crash during startup is caught by the same net as one an hour later.
      At that point there is no server yet, and that is a valid answer. */
  getServer: () => Server | null;
  /** Whatever must be closed after the sockets are. The database, here. */
  onClose: () => Promise<unknown>;
  /** Injected by the check script so a test can observe the code without
      taking the test runner down with it. */
  exit?: (code: number) => void;
  graceMs?: number;
  log?: (message: string, ...rest: unknown[]) => void;
  logError?: (message: string, ...rest: unknown[]) => void;
}

export interface Lifecycle {
  shutdown: (reason: string, code: number) => Promise<void>;
  /** True once a shutdown has begun. */
  isClosing: () => boolean;
}

export function installLifecycle(options: LifecycleOptions): Lifecycle {
  const {
    getServer,
    onClose,
    exit = (code) => process.exit(code),
    graceMs = GRACE_MS,
    log = (m, ...r) => console.log(m, ...r),
    logError = (m, ...r) => console.error(m, ...r),
  } = options;

  /* Shutdown runs once. A SIGTERM arriving during an uncaughtException
     shutdown must not start a second one racing the first — they would both
     call exit(), and the winner would decide the code by chance. */
  let closing = false;

  const shutdown = async (reason: string, code: number): Promise<void> => {
    if (closing) return;
    closing = true;
    log(`[shutdown] ${reason} — closing`);

    /* The backstop. If a socket refuses to close — a hung keep-alive, a
       streaming response nobody is reading — the process still goes, on time
       and on our terms rather than the platform's. */
    const hard = setTimeout(() => {
      logError("[shutdown] grace period expired — exiting now");
      exit(code);
    }, graceMs);
    /* Not a reason to keep the process alive on its own. */
    hard.unref();

    const server = getServer();
    if (server) {
      try {
        await new Promise<void>((resolve) => {
          /* Stops accepting new connections; the callback fires once those
             already open have finished. */
          server.close(() => resolve());
        });
        log("[shutdown] http server closed");
      } catch (err) {
        logError("[shutdown] error closing http server:", err);
      }
    }

    try {
      await onClose();
      log("[shutdown] database disconnected");
    } catch (err) {
      /* Logged, never rethrown. A database that will not close cleanly must
         not stop the process from exiting — that is how a deploy hangs. */
      logError("[shutdown] error closing the database:", err);
    }

    clearTimeout(hard);
    exit(code);
  };

  process.on("uncaughtException", (err) => {
    logError("[fatal] uncaught exception:", err);
    void shutdown("uncaught exception", 1);
  });

  /* Node's default for an unhandled rejection is already to terminate, but
     it does so without running any of the above — so this exists to drain
     and close the database, not to change whether the process dies. */
  process.on("unhandledRejection", (reason) => {
    logError("[fatal] unhandled promise rejection:", reason);
    void shutdown("unhandled rejection", 1);
  });

  /* The ordinary ones. A deploy is a SIGTERM; Ctrl+C is a SIGINT. Neither is
     an error, so both exit 0. */
  process.on("SIGTERM", () => void shutdown("SIGTERM", 0));
  process.on("SIGINT", () => void shutdown("SIGINT", 0));

  return { shutdown, isClosing: () => closing };
}
