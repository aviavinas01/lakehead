import { Router } from "express";
import { getRating } from "../../controllers/googleRating.controller.js";

const router = Router();

/* Public: the footer's Google rating summary */
router.get("/", getRating);

export default router;
