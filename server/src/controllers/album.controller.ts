import { asyncHandler } from "../utils/asyncHandler.js";
import { albumService } from "../services/album.service.js";

export const listPublished = asyncHandler(async (_req, res) => {
  res.json({ albums: await albumService.listPublished() });
});

export const getBySlug = asyncHandler(async (req, res) => {
  res.json(await albumService.getPublishedBySlug(req.params.slug as string));
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ albums: await albumService.listAll() });
});

export const getById = asyncHandler(async (req, res) => {
  res.json({ album: await albumService.getById(req.params.id as string) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ album: await albumService.create(req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ album: await albumService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await albumService.remove(req.params.id as string);
  res.json({ message: "Album deleted" });
});
