import { asyncHandler } from "../utils/asyncHandler.js";
import { youtubeService, FEEDS, type Feed } from "../services/youtube.service.js";

export const listVideos = asyncHandler(async (req, res) => {
  /* ?feed=testimonials selects the second playlist; anything unrecognised
     falls back to the main one rather than erroring. */
  const requested = String(req.query.feed ?? "stories");
  const feed = (FEEDS as readonly string[]).includes(requested)
    ? (requested as Feed)
    : "stories";
  res.json({ videos: await youtubeService.list(feed) });
});
