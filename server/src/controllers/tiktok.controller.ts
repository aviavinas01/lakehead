import { asyncHandler } from "../utils/asyncHandler.js";
import { tiktokService } from "../services/tiktok.service.js";

export const listPublished = asyncHandler(async (_req, res) => {
  res.json({ clips: await tiktokService.listPublished() });
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ clips: await tiktokService.listAll() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ clip: await tiktokService.create(req.body.url as string) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ clip: await tiktokService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await tiktokService.remove(req.params.id as string);
  res.json({ message: "Clip removed" });
});
