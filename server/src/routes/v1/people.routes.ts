import { Router } from "express";
import * as people from "../../controllers/people.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  saveDirectorSchema,
  createStaffSchema,
  updateStaffSchema,
} from "../../validators/people.schema.js";

/**
 * The people behind the consultancy: one director's message and the team.
 *
 * One router for both because they are one admin screen and one idea, but
 * two collections underneath — see the models for why they are not merged.
 *
 * NOTE THE ORDER OF THE DIRECTOR ROUTES. "/director/admin" is declared
 * before "/director" would ever be reached with a sub-path, and both are
 * static, so there is no `:id` here for a literal segment to be swallowed
 * by. The staff routes below do carry an :id, which is why "/staff/admin"
 * comes first: registered the other way round, Express would match "admin"
 * as an id and every admin listing would 400 on the length check.
 */
const router = Router();

// Public
router.get("/director", people.getDirector);
router.get("/staff", people.listStaff);

// Authenticated (admin + editor)
router.get("/director/admin", protect, people.getDirectorAdmin);
router.put("/director", protect, validate(saveDirectorSchema), people.saveDirector);

router.get("/staff/admin", protect, people.listStaffAdmin);
router.post("/staff", protect, validate(createStaffSchema), people.createStaff);
router.patch("/staff/:id", protect, validate(updateStaffSchema), people.updateStaff);
router.delete("/staff/:id", protect, requireRole("admin"), people.removeStaff);

export default router;
