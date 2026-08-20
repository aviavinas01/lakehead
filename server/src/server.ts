import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const start = async () => {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => console.log(`API running on :${env.PORT} (${env.NODE_ENV})`));
};

start();
