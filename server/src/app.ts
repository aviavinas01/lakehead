import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import v1Routes from "./routes/v1/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { UPLOADS_DIR } from "./middleware/upload.js";
import { csrfGuard } from "./middleware/csrf.js";
import { adminState } from "./config/ensureAdmin.js";

/** When this process came up — how long the current build has been serving. */
const STARTED_AT = new Date().toISOString();

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1); // required behind Render/Railway/Vercel proxies
  // crossOriginResourcePolicy relaxed so the client origin can load /uploads media
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "1d" }));

  /**
   * Health, and enough of it to end an argument.
   *
   * `status: "ok"` alone answers only "is something listening", which was
   * never the question. Sign-in has several prerequisites that each fail
   * silently and identically, so each one is reported here — measured, never
   * inferred:
   *
   *   commit    which build is serving. A FAILED DEPLOY LEAVES THE PREVIOUS
   *             BUILD RUNNING and Render still shows the service as live, so
   *             symptoms get debugged against source that is not running.
   *             Compare against `git rev-parse --short HEAD`.
   *   admin     whether the one account that can sign in exists. "missing"
   *             means every correct password will be refused.
   *   request   what the browser actually sent. `cookies` is the decisive
   *             one: open this URL in the browser that cannot sign in, and
   *             an empty list means the browser is not carrying cookies to
   *             this API at all — the third-party cookie problem, observed
   *             rather than guessed. Compare `origin` with `host`: if they
   *             differ, every cookie here is a third-party cookie.
   *
   * Nothing here is a secret. `cookies` lists names only, never values, and
   * they are the caller's own cookies handed back to the caller. It is public
   * on purpose: a diagnostic that sits behind the broken sign-in is no
   * diagnostic at all.
   */
  app.get("/api/health", (req, res) =>
    res.json({
      status: "ok",
      commit: env.RENDER_GIT_COMMIT?.slice(0, 7) ?? "local",
      startedAt: STARTED_AT,
      admin: adminState(),
      request: {
        origin: req.get("origin") ?? null,
        host: req.get("x-forwarded-host") ?? req.get("host") ?? null,
        cookies: Object.keys(req.cookies ?? {}),
      },
    })
  );
  /* Every mutating request must carry the header our own client sends. See
     middleware/csrf.ts — this is what stops the session cookie, which is
     `sameSite: "none"` in production, being spent by somebody else's page.
     Mounted on the API only: /uploads is static files and has nothing to
     forge, and the health check is a GET. */
  app.use("/api/v1", csrfGuard, v1Routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
