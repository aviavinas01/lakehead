import { asyncHandler } from "../utils/asyncHandler.js";
import { googleRatingService } from "../services/googleRating.service.js";

export const getRating = asyncHandler(async (_req, res) => {
  res.json({ rating: await googleRatingService.get() });
});
