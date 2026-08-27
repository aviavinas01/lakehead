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

/**
 * GET /youtube/status — why the row is or is not showing anything.
 *
 * Deliberately public and deliberately dull: it reports whether a source is
 * configured, how many videos are cached, which source they came from, how
 * long ago it checked, and the last upstream error. It never returns the
 * playlist or channel id itself, so it gives away nothing that the videos on
 * the page do not already.
 */
export const status = asyncHandler(async (_req, res) => {
  res.json({ feeds: youtubeService.status() });
});
