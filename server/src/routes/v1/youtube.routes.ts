import { Router } from "express";
import { listVideos, status } from "../../controllers/youtube.controller.js";

const router = Router();

/* Public: the Success Stories row on the home page */
router.get("/videos", listVideos);

/* Public: why that row is empty, when it is. Carries no ids or secrets. */
router.get("/status", status);

export default router;
