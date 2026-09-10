import { Router } from "express";
import * as universities from "../../controllers/university.controller.js";
import { protect, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createUniversitySchema,
  updateUniversitySchema,
} from "../../validators/university.schema.js";

/**
 * The partner institutions — the wall on /university-partners and a page
 * each at /university-partners/<slug>.
 *
 * ORDER MATTERS HERE, and in one specific way: "/admin" is declared before
 * "/:slug". Registered the other way round, Express would match "admin" as a
 * slug and the admin listing would come back as a 404 for an institution
 * called "admin". The same trap the staff routes carry a note about.
 *
 * Deleting is admin-only while adding and editing are open to editors, which
 * matches every other content type here: an editor curates, an administrator
 * destroys.
 */
const router = Router();

// Public
router.get("/", universities.list);

// Authenticated (admin + editor). Declared before "/:slug" — see above.
router.get("/admin", protect, universities.listAdmin);
router.post("/", protect, validate(createUniversitySchema), universities.create);
router.patch(
  "/:id",
  protect,
  validate(updateUniversitySchema),
  universities.update
);
router.delete("/:id", protect, requireRole("admin"), universities.remove);

/* Last, so no literal segment above can be swallowed as a slug. */
router.get("/:slug", universities.getBySlug);

export default router;
