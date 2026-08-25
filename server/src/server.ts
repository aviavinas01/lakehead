import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { youtubeService } from "./services/youtube.service.js";
import { env } from "./config/env.js";

const start = async () => {
  await connectDB();
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
