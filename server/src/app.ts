import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import v1Routes from "./routes/v1/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { UPLOADS_DIR } from "./middleware/upload.js";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1); // required behind Render/Railway/Vercel proxies
  // crossOriginResourcePolicy relaxed so the client origin can load /uploads media
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "1d" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/v1", v1Routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
