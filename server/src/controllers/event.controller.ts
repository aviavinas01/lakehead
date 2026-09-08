import { asyncHandler } from "../utils/asyncHandler.js";
import { eventService, type EventInput } from "../services/event.service.js";

export const listPublished = asyncHandler(async (_req, res) => {
  res.json({ events: await eventService.listPublished() });
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ events: await eventService.listAll() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ event: await eventService.create(req.body as EventInput) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({
    event: await eventService.update(req.params.id as string, req.body as EventInput),
  });
});

export const remove = asyncHandler(async (req, res) => {
  await eventService.remove(req.params.id as string);
  res.json({ message: "Event removed" });
});
