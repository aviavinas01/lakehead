import { Router } from "express";
import * as assistant from "../../controllers/assistant.controller.js";
import { validate } from "../../middleware/validate.js";
import { assistantLimiter } from "../../middleware/rateLimiters.js";
import { askSchema, suggestionSchema } from "../../validators/assistant.schema.js";

/**
 * The Lakehead assistant — the chat dock in the corner of every public page.
 *
 * ENTIRELY PUBLIC AND ENTIRELY READ-ONLY. Nothing here writes anything, and
 * no question anybody types is stored: the endpoint takes a string, picks one
 * of the paragraphs in data/faqs.ts, and returns it. That is worth being
 * deliberate about — a chat box is where people paste passport numbers and
 * personal circumstances without thinking, and the safest thing to do with
 * that is not to keep it.
 *
 * The rate limit is on the two routes that do work. `/start` and `/topics`
 * are constants and are left alone.
 */
const router = Router();

router.get("/start", assistant.start);
router.get("/topics", assistant.listAll);

router.post("/ask", assistantLimiter, validate(askSchema), assistant.askQuestion);
router.get(
  "/question/:id",
  assistantLimiter,
  validate(suggestionSchema),
  assistant.answerById
);

export default router;
