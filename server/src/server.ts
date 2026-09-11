import type { Server } from "node:http";
import { createApp } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { ensureAdmin } from "./config/ensureAdmin.js";
import { installLifecycle } from "./config/lifecycle.js";
import { youtubeService } from "./services/youtube.service.js";
import { env } from "./config/env.js";

/**
 * Starting the server.
 *
 * How it STOPS — on a deploy, a signal or a bug — is config/lifecycle.ts,
 * which is installed first so that a failure during startup is caught by the
 * same net as one an hour later.
 */

let server: Server | null = null;

const lifecycle = installLifecycle({
  /* Lazy: at install time there is no server yet, and that is the point. */
  getServer: () => server,
  onClose: disconnectDB,
});

const start = async () => {
  await connectDB();

  /* The admin account is made to exist before anything can try to sign in.
     A FAILURE HERE DOES NOT STOP THE SERVER: the public site — every page a
     visitor sees, and the contact form — needs no admin at all, and taking
     it down because one account could not be written would turn a dashboard
     problem into an outage. It is loud in the log instead, which is where
     the person who can fix it is looking. */
  try {
    await ensureAdmin();
  } catch (err) {
    console.error("[admin] could not be ensured — sign-in will fail:", err);
  }

  const app = createApp();
  server = app.listen(env.PORT, () => {
    console.log(`API running on :${env.PORT} (${env.NODE_ENV})`);
    /* Pull the video feed straight away rather than on the first visitor:
       a redeploy starts with an empty in-memory cache, and this is what
       stops the row being empty for whoever arrives first. */
    youtubeService.warm();
  });
};

/* A failure to start is fatal and says so. Without this catch it would
   surface as an unhandled rejection whose stack points here rather than at
   connectDB, which is where the answer usually is. */
start().catch((err) => {
  console.error("[fatal] the server could not start:", err);
  void lifecycle.shutdown("startup failure", 1);
});
