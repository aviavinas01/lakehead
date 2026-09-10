import api from "./client";

/**
 * The Lakehead assistant.
 *
 * THE KNOWLEDGE BASE IS NOT HERE. Every answer, every suggestion and every
 * word of the fallback comes from the server — the client posts a question
 * and renders what comes back. Nothing about what the assistant knows, or how
 * it decides, ships to the browser.
 *
 * Every call is `quiet`: the dock has its own typing indicator, and raising
 * the site-wide loading veil over the whole page because somebody asked a
 * question in a corner panel would be absurd. See context/LoadingContext.
 */

export interface Suggestion {
  id: string;
  question: string;
}

/** `declined` is abuse or spam — the server never matches such a message
    against the knowledge base, so it carries no `matched`. */
export type ReplyKind =
  | "answer"
  | "maybe"
  | "handoff"
  | "greeting"
  | "declined";

export interface AssistantReply {
  kind: ReplyKind;
  text: string;
  /** A short second bubble, sent a beat after the answer. */
  followUp?: string;
  matched?: { id: string; question: string; topic: string };
  link?: { label: string; to: string };
  suggestions: Suggestion[];
  offerContact: boolean;
}

export interface AssistantStart {
  greeting: string;
  suggestions: Suggestion[];
}

export const fetchStart = async (): Promise<AssistantStart> =>
  (await api.get<AssistantStart>("/assistant/start", { quiet: true })).data;

export const askAssistant = async (question: string): Promise<AssistantReply> =>
  (
    await api.post<{ reply: AssistantReply }>(
      "/assistant/ask",
      { question },
      { quiet: true }
    )
  ).data.reply;

/** A suggestion chip is answered by its id — it came from us, so there is
    nothing to guess about what it meant. */
export const askById = async (id: string): Promise<AssistantReply> =>
  (
    await api.get<{ reply: AssistantReply }>(`/assistant/question/${id}`, {
      quiet: true,
    })
  ).data.reply;
