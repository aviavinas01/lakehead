import { Router } from "express";
import authRoutes from "./auth.routes.js";
import postRoutes from "./post.routes.js";
import inquiryRoutes from "./inquiry.routes.js";
import albumRoutes from "./album.routes.js";
import mediaRoutes from "./media.routes.js";
import googleRatingRoutes from "./googleRating.routes.js";
import youtubeRoutes from "./youtube.routes.js";
import tiktokRoutes from "./tiktok.routes.js";
import eventRoutes from "./event.routes.js";
import newsRoutes from "./news.routes.js";
import peopleRoutes from "./people.routes.js";
import assistantRoutes from "./assistant.routes.js";
import clientErrorRoutes from "./clientError.routes.js";
import gateRoutes from "./gate.routes.js";

const v1 = Router();

v1.use("/auth", authRoutes);
v1.use("/posts", postRoutes);
v1.use("/inquiries", inquiryRoutes);
/* No /users. The site has exactly one account, created from ADMIN_EMAIL and
   ADMIN_PASSWORD at boot — see config/seedAdmin.ts. Removing the routes
   rather than guarding them is the point: a session that is somehow taken
   over still cannot mint a second way in, because there is no endpoint that
   makes one. */
v1.use("/albums", albumRoutes);
v1.use("/media", mediaRoutes);
v1.use("/google-rating", googleRatingRoutes);
v1.use("/youtube", youtubeRoutes);
v1.use("/tiktok", tiktokRoutes);
/* Both entirely ours — nothing is fetched from anywhere. An event exists
   because the office typed it in; a news item is a link the office chose to
   point at. See the models for why neither reads the site it references. */
v1.use("/events", eventRoutes);
v1.use("/news", newsRoutes);
/* The director's message and the team. Both are ours, both are edited in
   one admin screen, and neither is fetched from anywhere. */
v1.use("/people", peopleRoutes);
/* The chat dock in the corner of every public page. Read-only, stores
   nothing, and answers only from data/faqs.ts — see the routes file. */
v1.use("/assistant", assistantRoutes);
/* Where the browser says it crashed. Logs only, never stores — see the
   controller. */
v1.use("/client-errors", clientErrorRoutes);
v1.use("/gate", gateRoutes);

export default v1;
