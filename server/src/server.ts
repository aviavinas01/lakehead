import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { ensureAdmin } from "./config/ensureAdmin.js";
import { youtubeService } from "./services/youtube.service.js";
import { env } from "./config/env.js";

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
  app.listen(env.PORT, () => {
    console.log(`API running on :${env.PORT} (${env.NODE_ENV})`);
    /* Pull the video feed straight away rather than on the first visitor:
       a redeploy starts with an empty in-memory cache, and this is what
       stops the row being empty for whoever arrives first. */
    youtubeService.warm();
  });
};

start();
