import { asyncHandler } from "../utils/asyncHandler.js";
import {
  universityService,
  type UniversityInput,
} from "../services/university.service.js";

export const list = asyncHandler(async (_req, res) => {
  res.json({ universities: await universityService.listPublished() });
});

export const listAdmin = asyncHandler(async (_req, res) => {
  res.json({ universities: await universityService.listAll() });
});

/* 404s on an unpublished record as well as a missing one — see the note on
   getPublishedBySlug. */
export const getBySlug = asyncHandler(async (req, res) => {
  res.json({
    university: await universityService.getPublishedBySlug(req.params.slug as string),
  });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({
    university: await universityService.create(req.body as UniversityInput),
  });
});

export const update = asyncHandler(async (req, res) => {
  res.json({
    university: await universityService.update(
      req.params.id as string,
      req.body as UniversityInput
    ),
  });
});

export const remove = asyncHandler(async (req, res) => {
  await universityService.remove(req.params.id as string);
  res.json({ message: "University removed" });
});
