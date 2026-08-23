import { Router } from "express";
import { listVideos } from "../../controllers/youtube.controller.js";

const router = Router();

/* Public: the Success Stories row on the home page */
router.get("/videos", listVideos);

export default router;
