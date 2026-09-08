import { asyncHandler } from "../utils/asyncHandler.js";
import { newsService, type NewsInput } from "../services/news.service.js";

export const listPublished = asyncHandler(async (req, res) => {
  /* A page may want only the first few. Clamped rather than trusted: an
     unbounded ?limit is a way to ask the database for everything at once. */
  const raw = Number(req.query.limit);
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 50) : undefined;
  res.json({ news: await newsService.listPublished(limit) });
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ news: await newsService.listAll() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ item: await newsService.create(req.body as NewsInput) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({
    item: await newsService.update(req.params.id as string, req.body as NewsInput),
  });
});

export const remove = asyncHandler(async (req, res) => {
  await newsService.remove(req.params.id as string);
  res.json({ message: "News item removed" });
});
