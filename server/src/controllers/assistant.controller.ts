import { asyncHandler } from "../utils/asyncHandler.js";
import { ask, byId, openers, catalogue } from "../services/assistant.service.js";
import { ApiError } from "../utils/ApiError.js";

/** What the panel shows before anybody has typed: a welcome and some chips. */
export const start = asyncHandler(async (_req, res) => {
  res.json({
    greeting:
      "Hello, and welcome to Lakehead. I can help with questions about studying abroad — choosing a country, tests, costs, visas, and what to expect once you land. Ask me anything, or start with one of these.",
    suggestions: openers(),
  });
});

export const askQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body as { question: string };
  res.json({ reply: ask(question) });
});

/* A chip is answered by id rather than by re-matching its text — the chip
   came from us, so there is nothing to guess about what it meant. */
export const answerById = asyncHandler(async (req, res) => {
  const reply = byId(req.params.id as string);
  if (!reply) throw ApiError.notFound("No such question");
  res.json({ reply });
});

/** Every question we can answer, grouped. For a public FAQ page later. */
export const listAll = asyncHandler(async (_req, res) => {
  res.json({ topics: catalogue() });
});
