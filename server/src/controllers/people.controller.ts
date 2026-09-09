import { asyncHandler } from "../utils/asyncHandler.js";
import {
  peopleService,
  type DirectorInput,
  type StaffInput,
} from "../services/people.service.js";

/* `director: null` rather than a 404 when nothing has been written yet — see
   the note on getPublishedDirector. The page renders a placeholder; the
   address is still a real one. */
export const getDirector = asyncHandler(async (_req, res) => {
  res.json({ director: await peopleService.getPublishedDirector() });
});

export const getDirectorAdmin = asyncHandler(async (_req, res) => {
  res.json({ director: await peopleService.getDirector() });
});

export const saveDirector = asyncHandler(async (req, res) => {
  res.json({ director: await peopleService.saveDirector(req.body as DirectorInput) });
});

export const listStaff = asyncHandler(async (_req, res) => {
  res.json({ staff: await peopleService.listPublishedStaff() });
});

export const listStaffAdmin = asyncHandler(async (_req, res) => {
  res.json({ staff: await peopleService.listAllStaff() });
});

export const createStaff = asyncHandler(async (req, res) => {
  res.status(201).json({ member: await peopleService.createStaff(req.body as StaffInput) });
});

export const updateStaff = asyncHandler(async (req, res) => {
  res.json({
    member: await peopleService.updateStaff(req.params.id as string, req.body as StaffInput),
  });
});

export const removeStaff = asyncHandler(async (req, res) => {
  await peopleService.removeStaff(req.params.id as string);
  res.json({ message: "Staff member removed" });
});
