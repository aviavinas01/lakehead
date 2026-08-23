import { asyncHandler } from "../utils/asyncHandler.js";
import { youtubeService } from "../services/youtube.service.js";

export const listVideos = asyncHandler(async (_req, res) => {
  res.json({ videos: await youtubeService.list() });
});
