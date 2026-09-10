/**
 * What the assistant refuses to engage with, and how it says so.
 *
 * ------------------------------------------------------------------
 * THREE THINGS ARE CAUGHT HERE, and they want different answers.
 *
 *   ABUSE      — someone swearing at a chat box. Answered once, calmly, with
 *                the door left open. Not scolded, not lectured, and never
 *                matched against the knowledge base: an insult containing
 *                the word "visa" should not return the visa answer.
 *   SPAM       — pasted links, mashed keyboards, walls of one character. The
 *                reply says what the assistant can do instead.
 *   OFF-TOPIC  — a real question about something we do not cover. That is
 *                NOT handled here; it falls out of the matcher's confidence
 *                score, and the reply names the three things we do cover.
 *
 * WHY THE PROFANITY LIST IS SHORT. A long list is a liability, not a
 * feature: match on substrings and "Scunthorpe" is obscene, "assam" is
 * obscene, "bass" is obscene. Everything here is matched as a WHOLE WORD
 * after the message is normalised, and the list holds only terms that have
 * no innocent reading. A student who slips is far better served by being
 * answered than by being told off for a word we half-recognised.
 *
 * NOTHING HERE BLOCKS ANYONE. There is no session and no ban list — the rate
 * limiter on the route is what stops volume. This decides what one message
 * gets as a reply, and that is all it decides.
 * ------------------------------------------------------------------
 */

/**
 * Unambiguous abuse. Whole words only.
 *
 * Deliberately excludes anything with a clean homograph or a place name in
 * it, and anything mild enough that a frustrated student might reasonably
 * type it while asking a genuine question.
 */
const ABUSE = new Set([
  "fuck", "fucking", "fucker", "fuk", "fck", "shit", "shitty", "bullshit",
  "bitch", "bastard", "cunt", "dick", "asshole", "arsehole", "wanker",
  "motherfucker", "slut", "whore", "retard", "retarded", "nigger", "faggot",
  "randi", "chutiya", "madarchod", "bhosdike", "gandu", "harami",
  "idiot", "stupid", "useless", "nonsense", "scam", "fraud", "cheater",
]);

/* The last few are insults about US rather than swearing, and they are worth
   separating: "is this a scam" is a fair question and "you are a scam" is
   not. Only the second reading reaches here — see `isAbusive`. */
const ABOUT_US = new Set(["scam", "fraud", "cheater", "useless", "stupid", "nonsense", "idiot"]);

/**
 * Letters only, every run of a repeated letter collapsed to one.
 *
 * "fuuuuuck", "f.u.c.k" and "shiiit" all land on their plain form. The lists
 * below are squashed the same way at load, so both sides of the comparison
 * are in the same shape — collapsing only one of them was why "fuuuuuck"
 * slipped through as "fuuck".
 *
 * Safe against the obvious false positives: "assam" becomes "asam", "bass"
 * becomes "bas", "sheet" becomes "shet". None land on anything in the lists.
 */
const squash = (word: string) =>
  word.replace(/[^a-z]/g, "").replace(/(.)\1+/g, "$1");

/* Squashed once at load, so squash(word) can be compared directly. */
const ABUSE_CANON = new Set([...ABUSE].map(squash));
const ABOUT_US_CANON = new Set([...ABOUT_US].map(squash));

export interface Refusal {
  reason: "abuse" | "spam" | "empty";
  text: string;
}

/**
 * Is this abuse rather than a question?
 *
 * The `ABOUT_US` words only count when they are aimed at somebody — "is
 * lakehead a scam" is a reasonable thing to want reassuring about and gets a
 * real answer, while "you are a scam" does not. The test is whether the
 * message addresses us directly.
 */
export function isAbusive(words: string[], normalised: string): boolean {
  const aimed = /\b(you|your|u|ur|lakehead|this)\b/.test(normalised);
  for (const w of words) {
    const b = squash(w);
    if (!b) continue;
    if (ABOUT_US_CANON.has(b)) {
      /* "you are useless" — abuse. "is this a scam" — a question. The
         difference is whether it is a statement about us or a question. */
      if (aimed && !normalised.includes("?") && !/^(is|are|was|does|do)\b/.test(normalised)) {
        return true;
      }
      continue;
    }
    if (ABUSE_CANON.has(b)) return true;
  }
  return false;
}

/**
 * Does this look like spam or a mashed keyboard rather than a question?
 *
 * Every rule here is deliberately conservative — a false positive tells a
 * real student their real question is rubbish, which is far worse than
 * letting a bit of nonsense through to the matcher, where it would score
 * nothing and be handed off politely anyway.
 */
export function isSpammy(raw: string, words: string[]): boolean {
  const letters = raw.replace(/[^a-zA-Z]/g, "").length;

  /* A wall of one character: "aaaaaaaaaaaa", "!!!!!!!!!!!!". */
  if (/(.)\1{7,}/.test(raw)) return true;

  /* Almost no letters in something long — digits, symbols, emoji spam. */
  if (raw.length > 12 && letters / raw.length < 0.4) return true;

  /* One enormous unbroken token. Real questions have spaces in them. */
  if (words.some((w) => w.length > 24)) return true;

  /* A mashed keyboard: a long word with a consonant run no English word has.
     Six is the floor — "strengths" has four, and words like "borscht" sit
     just under it. */
  if (words.some((w) => w.length > 6 && /[bcdfghjklmnpqrstvwxz]{6,}/i.test(w))) {
    return true;
  }

  return false;
}

/** Every http(s):// or bare www. address in the message. */
const URL_RX = /\b(?:https?:\/\/|www\.)\S+|\b\S+\.(?:com|net|org|edu|io|co)\b/gi;

export function stripLinks(raw: string): { text: string; had: boolean } {
  const had = URL_RX.test(raw);
  URL_RX.lastIndex = 0;
  return { text: had ? raw.replace(URL_RX, " ").trim() : raw, had };
}

/**
 * The replies themselves.
 *
 * WARM, BRIEF, AND WITHOUT A LECTURE. Somebody swearing at a chat box is
 * usually frustrated rather than malicious, and the useful response is to
 * decline the message and offer to help with the next one. Moralising at
 * them guarantees there is no next one.
 */
export const REFUSALS: Record<Refusal["reason"], string> = {
  abuse:
    "I would rather keep this friendly, so I will leave that one there. If there is something you would like to know about studying abroad, test preparation or visas, I am glad to help.",
  spam:
    "I could not make sense of that one, sorry. I can help with studying abroad, preparing for tests like IELTS and PTE, and student visas — ask me anything in those areas.",
  empty:
    "I did not quite catch that — could you put it another way? I can help with studying abroad, test preparation and visas.",
};

/** The one line the assistant uses to say what it is for. */
export const SCOPE =
  "studying abroad, test preparation and student visas";
