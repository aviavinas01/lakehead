import { asyncHandler } from "../utils/asyncHandler.js";
import { tiktokService } from "../services/tiktok.service.js";

export const listPublished = asyncHandler(async (req, res) => {
  const category = req.query.category;
  /* An unknown or missing category returns nothing rather than everything.
     The shelves are page-specific, so "all of them" is not a view any page
     wants, and answering with the lot would put visa clips under the
     testimonials the first time a query string was mistyped. */
  if (!tiktokService.isCategory(category)) {
    res.json({ clips: [] });
    return;
  }
  res.json({ clips: await tiktokService.listPublished(category) });
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ clips: await tiktokService.listAll() });
});

export const create = asyncHandler(async (req, res) => {
  const { url, category } = req.body as { url: string; category?: unknown };
  res.status(201).json({
    clip: await tiktokService.create(
      url,
      tiktokService.isCategory(category) ? category : undefined
    ),
  });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ clip: await tiktokService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await tiktokService.remove(req.params.id as string);
  res.json({ message: "Clip removed" });
});
