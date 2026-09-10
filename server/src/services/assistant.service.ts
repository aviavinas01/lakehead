import { FAQS, type Faq, type FaqTopic } from "../data/faqs.js";
import {
  isAbusive,
  isSpammy,
  stripLinks,
  REFUSALS,
  SCOPE,
} from "./assistantGuard.js";

/**
 * The Lakehead assistant's matcher.
 *
 * ------------------------------------------------------------------
 * NO MODEL, AND THAT IS A DELIBERATE CHOICE RATHER THAN A LIMITATION.
 *
 * This is an education consultancy. A language model asked "how much do I
 * need in the bank for a UK student visa" will produce a confident, plausible
 * figure whether or not it knows one, and a student who acts on it can lose
 * an intake and an application fee. Every answer this returns is a paragraph
 * a person at Lakehead wrote and approved; the code's only job is to pick
 * which one, and to say honestly when it cannot.
 *
 * HOW IT PICKS. Each question is scored against three fields of every entry,
 * weighted heaviest on the hand-written keywords, and every token is weighted
 * by how rare it is across the corpus. That last part is what stops the
 * common words carrying a match: "how much does a visa cost" and "how much
 * luggage can I take" share three of six words, and it is `cost` and
 * `luggage` — the rare ones — that decide it, not `how`, `much` or `can`.
 *
 * WHEN IT IS NOT SURE, IT SAYS SO. Below CONFIDENT the answer is a handoff to
 * a counsellor rather than the least-bad guess. That threshold is the single
 * most important number here: too low and it answers the wrong question with
 * total assurance, which is worse than not answering. It is tuned against a
 * list of real phrasings — see the check script.
 * ------------------------------------------------------------------
 */

/* ---------- normalising ---------- */

/** Words that carry no signal. Kept short: over-pruning loses real meaning. */
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
  "do", "does", "did", "doing", "have", "has", "had", "having", "will",
  "would", "shall", "should", "may", "might", "must", "of", "to", "in", "on",
  "at", "by", "for", "with", "about", "into", "from", "up", "out", "over",
  "and", "or", "but", "if", "then", "than", "so", "as", "that", "this",
  "these", "those", "it", "its", "i", "me", "my", "we", "us", "our", "you",
  "your", "they", "them", "their", "he", "she", "his", "her", "there",
  "here", "what", "which", "who", "whom", "when", "where", "why", "how",
  "please", "tell", "know", "want", "like", "get", "getting", "go", "going",
  "any", "some", "also", "just", "very", "really", "sir", "madam", "hi",
  "hello", "thanks", "thank", "ok", "okay", "yes", "no",

  /* ROMANISED NEPALI AND HINDI FILLER, which this audience types constantly.
     "scholorship kya hai" is a perfectly clear question, and before these
     were listed `kya` and `hai` were two words the index had never seen —
     so the familiarity penalty treated a clear question as half foreign and
     pushed the right answer below the confidence threshold. They carry no
     more meaning than "what" and "is", and they are dropped for the same
     reason. */
  "kya", "kaha", "kaise", "kasari", "kati", "kun", "kun-ma", "ke", "k",
  "hai", "hain", "ho", "cha", "chha", "xa", "huncha", "hunxa", "hunchha",
  "garne", "garna", "garda", "milcha", "milxa", "milchha", "sakcha",
  "sakincha", "lagi", "lagcha", "ma", "mero", "hamro", "timro", "tapai",
  "bhaneko", "bhanne", "vaneko", "matra", "pani", "ani", "tara", "ra",
  "ko", "lai", "bata", "sanga", "po", "ni", "hola", "tyo", "yo", "yesko",
]);

/**
 * Words that mean the same thing to a student, folded onto one token.
 *
 * DELIBERATELY CONSERVATIVE. Folding `work` onto `job` would merge "can I
 * work while studying" with "will this help me get a job", which are
 * different answers — so it is not done. What is folded here is only what is
 * genuinely interchangeable in this domain.
 */
const SYNONYMS: Record<string, string> = {
  programme: "course", program: "course", degree: "course", subject: "course",
  major: "course", stream: "course", faculty: "course", diploma: "course",
  bachelors: "course", masters: "course", undergraduate: "course",
  postgraduate: "course", phd: "course", mba: "course",
  uni: "university", college: "university", institution: "university",
  school: "university", campus: "university",
  cost: "money", price: "money", fee: "money", expense: "money",
  expensive: "money", afford: "money", charge: "money", budget: "money",
  cheap: "money", cheapest: "money", amount: "money", payment: "money",
  baggage: "luggage", suitcase: "luggage", bag: "luggage", kg: "luggage",
  paperwork: "document", paper: "document", doc: "document", docs: "document",
  file: "document", certificate: "document", attested: "document",
  notarised: "document", notarized: "document",
  overseas: "abroad", foreign: "abroad", outside: "abroad",
  requirement: "need", criteria: "need", eligibility: "need",
  eligible: "need", qualify: "need", required: "need", require: "need",
  requir: "need", necessary: "need", mandatory: "need", compulsory: "need",
  /* Romanised Nepali for "is needed" / "is required" — meaning, not
     filler, so it is folded rather than dropped. */
  chahincha: "need", chahinxa: "need", chahinchha: "need", chahiyo: "need",
  chahine: "need", parcha: "need", parxa: "need", parchha: "need",
  refused: "rejected", refusal: "rejected", denied: "rejected", reject: "rejected",
  deny: "rejected", decline: "rejected", refuse: "rejected",
  marksheet: "transcript", marks: "grade", percentage: "grade", gpa: "grade",
  cgpa: "grade", score: "grade", result: "grade", aggregate: "grade",
  assist: "help", support: "help", guidance: "help", advice: "help",
  kid: "child", children: "child", son: "child", daughter: "child",
  wife: "spouse", husband: "spouse", partner: "spouse",
  mum: "parent", mom: "parent", dad: "parent", mother: "parent",
  father: "parent", parents: "parent", guardian: "parent",
  lonely: "homesick", homesickness: "homesick", miss: "homesick",
  accomodation: "accommodation", hostel: "accommodation", dorm: "accommodation",
  dormitory: "accommodation", housing: "accommodation", room: "accommodation",
  flat: "accommodation", apartment: "accommodation", rent: "accommodation",
  permit: "visa", embassy: "embassy", consulate: "embassy",
  residency: "pr", settle: "pr", settlement: "pr", citizenship: "pr",
  agent: "consultancy", agency: "consultancy",

  /* NEPAL'S OWN VOCABULARY. A student here says "+2" and "SLC" far more
     often than "higher secondary", and a question that uses the local word
     should not be worse understood than one that uses ours. */
  slc: "see", "10": "see",
  plustwo: "neb", "12": "neb", intermediate: "neb", hseb: "neb",

  /* THE ABBREVIATIONS PEOPLE ACTUALLY TYPE. */
  psw: "postwork", opt: "postwork", info: "information", qn: "question",
  yr: "year", yrs: "year", uk: "uk", usa: "usa", nz: "newzealand",
  aus: "australia", oz: "australia", america: "usa", britain: "uk",
  england: "uk", canada: "canada", ilets: "ielts", ilts: "ielts",
};

/**
 * MISSPELLINGS, applied before anything else.
 *
 * This is not spellchecking for its own sake. Every one of these is a
 * spelling we have actually seen from students writing English as a second
 * language, and each one previously turned a perfectly clear question into a
 * word the index had never heard of — which, thanks to the familiarity
 * penalty, actively pushed the right answer further away. "tution" and
 * "collage" and "carrier" are not typos here, they are how a great many
 * people spell those words.
 */
const SPELLINGS: Record<string, string> = {
  tution: "tuition", tuiton: "tuition", tutuion: "tuition",
  collage: "college", colledge: "college",
  carrer: "career", carrier: "career", carreer: "career",
  scholorship: "scholarship", scholership: "scholarship",
  schlorship: "scholarship", scholarhip: "scholarship",
  univercity: "university", universty: "university", univeristy: "university",
  acommodation: "accommodation", accomodation: "accommodation",
  accomadation: "accommodation",
  viza: "visa", visaa: "visa", vissa: "visa",
  documnet: "document", documants: "document", documet: "document",
  requirment: "requirement", requirements: "requirement",
  eligable: "eligible", elligible: "eligible",
  experiance: "experience", experince: "experience",
  imigration: "immigration", immigraton: "immigration",
  bachlor: "bachelor", bachler: "bachelor", bechelor: "bachelor",
  abrod: "abroad", abroard: "abroad", abraod: "abroad",
  guidence: "guidance", guidnce: "guidance",
  foriegn: "foreign", recieve: "receive",
  intreview: "interview", intervew: "interview",
  consultency: "consultancy", consultancey: "consultancy",
  percentge: "percentage", percantage: "percentage",
  aplication: "application", applicaton: "application",
  admision: "admission", admisson: "admission",
  procces: "process", proces: "process", proccess: "process",
  expence: "expense", expenditure: "expense",
  cousin: "course", couse: "course", corse: "course", coures: "course",
  studing: "studying", studyng: "studying",
};

/** A light, conservative stem — plurals and the commonest verb endings. */
function stem(w: string): string {
  if (w.length <= 3) return w;
  for (const suf of ["ations", "ation", "ements", "ement", "ingly"]) {
    if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length);
  }
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("ing") && w.length > 5) return undouble(w.slice(0, -3));
  if (w.endsWith("ed") && w.length > 4) return undouble(w.slice(0, -2));
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * "plann" -> "plan", "stopp" -> "stop".
 *
 * English doubles the final consonant before -ing and -ed, and without
 * undoing it "planning" stems to `plann` while "plan" stems to `plan` — two
 * different tokens for one word, so a keyword written one way never matches a
 * question asked the other. `ss`, `ll` and `ff` are genuine endings and are
 * left alone.
 */
function undouble(w: string): string {
  const a = w[w.length - 1];
  const b = w[w.length - 2];
  if (a && a === b && !"slfz".includes(a) && w.length > 3) return w.slice(0, -1);
  return w;
}

/** Lowercase, strip accents and punctuation, collapse spaces. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenise(text: string): string[] {
  const out: string[] = [];
  for (const raw of normalise(text).split(" ")) {
    if (!raw || STOPWORDS.has(raw)) continue;
    /* spelling -> synonym -> stem -> synonym again, because stemming can
       reveal a word the synonym table knows ("scholarships" -> "scholarship"
       only after the plural comes off). */
    const spelled = SPELLINGS[raw] ?? raw;
    const folded = SYNONYMS[spelled] ?? spelled;
    const st = stem(folded);
    out.push(SYNONYMS[st] ?? SPELLINGS[st] ?? st);
  }
  return out;
}

/* ---------- the index, built once at module load ---------- */

interface Indexed {
  faq: Faq;
  /** Words listed as a keyword on their own — the strongest signal there is. */
  soloTokens: Set<string>;
  /** Words that only appear inside a multi-word keyword. Weaker: "apply" in
      "apply for passport" is not a claim on every question about applying. */
  phraseTokens: Set<string>;
  /** Multi-word keywords, normalised, matched as whole phrases. */
  phrases: string[];
  questionTokens: Set<string>;
  answerTokens: Set<string>;
}

const INDEX: Indexed[] = FAQS.map((faq) => {
  const solo = new Set<string>();
  const fromPhrase = new Set<string>();
  for (const k of faq.keywords) {
    const tokens = tokenise(k);
    if (normalise(k).includes(" ")) tokens.forEach((t) => fromPhrase.add(t));
    else tokens.forEach((t) => solo.add(t));
  }
  for (const t of solo) fromPhrase.delete(t);
  return {
    faq,
    soloTokens: solo,
    phraseTokens: fromPhrase,
    phrases: faq.keywords.map((k) => normalise(k)).filter((k) => k.includes(" ")),
    questionTokens: new Set(tokenise(faq.question)),
    answerTokens: new Set(tokenise(faq.answer)),
  };
});

/**
 * Inverse document frequency, over keywords and questions only.
 *
 * The answers are excluded from the count on purpose: they are long, so a
 * word appearing in twenty answers would look common and be discounted even
 * when it is the precise term of one entry's keywords.
 */
const IDF: Map<string, number> = (() => {
  const df = new Map<string, number>();
  for (const e of INDEX) {
    for (const t of new Set([...e.soloTokens, ...e.phraseTokens, ...e.questionTokens])) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }
  const n = INDEX.length;
  const idf = new Map<string, number>();
  for (const [t, c] of df) idf.set(t, Math.log(1 + n / c));
  return idf;
})();

/** Unknown words are treated as rare — a term we have never indexed is
    exactly the sort that should count for a lot when it does hit. */
const idf = (t: string) => IDF.get(t) ?? Math.log(1 + INDEX.length);

/**
 * The subjects the knowledge base is ABOUT — keywords and questions only.
 *
 * The answers are deliberately excluded. They are long stretches of ordinary
 * prose and they drag in words that have nothing to do with what we can
 * answer: `capital` is in this file exactly once, in a sentence about living
 * costs differing between a capital and a regional town, and its presence
 * there was enough to make "what is the capital of Australia" look like a
 * question we cover. Keywords and questions are what somebody deliberately
 * said this entry answers.
 */
const VOCABULARY: Set<string> = new Set(
  INDEX.flatMap((e) => [...e.soloTokens, ...e.phraseTokens, ...e.questionTokens])
);

/* ---------- scoring ---------- */

/** A word listed as a keyword on its own. */
const W_SOLO = 3.0;
/** The same word, but only ever seen inside a multi-word keyword. */
const W_IN_PHRASE = 1.5;
const W_QUESTION = 1.2;
const W_ANSWER = 0.3;
/** A whole-phrase hit, per word in the phrase. Set above W_SOLO deliberately:
    "when should i start" appearing verbatim is a better signal than any
    single word in the sentence. */
const W_PHRASE = 3.0;

/**
 * Confidence floors.
 *
 * CONFIDENT — answer it.
 * MAYBE     — offer it as "did you mean", rather than asserting it.
 * below     — hand off to a counsellor and suggest some things it does know.
 */
/* TUNED, NOT GUESSED. scripts/checkAssistant.ts sweeps these against 72 real
   phrasings and 8 questions we have no business answering. At 0.32 the
   assistant answers 69 of the 72 correctly, gets none of them wrong, and lets
   none of the 8 through — the nearest miss being "what is the capital of
   Australia" at 0.31, which is the case the familiarity penalty above exists
   for. Raising it costs real answers; lowering it starts answering trivia.
   Re-run that script if you touch either number. */
const CONFIDENT = 0.32;
/* Below CONFIDENT but above this, it offers the match as a question rather
   than asserting it — "did you mean…", with a counsellor beside it. */
const MAYBE = 0.18;

function scoreOne(
  e: Indexed,
  qTokens: string[],
  qNorm: string
): { score: number; hits: number } {
  let score = 0;

  for (const p of e.phrases) {
    if (qNorm.includes(p)) score += W_PHRASE * p.split(" ").length;
  }

  const seen = new Set<string>();
  let answerHits = 0;
  let hits = 0;
  for (const t of qTokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    const weight = idf(t);
    if (e.soloTokens.has(t)) {
      score += W_SOLO * weight;
      hits++;
    } else if (e.phraseTokens.has(t)) {
      score += W_IN_PHRASE * weight;
      hits++;
    } else if (e.questionTokens.has(t)) {
      score += W_QUESTION * weight;
      hits++;
    } else if (e.answerTokens.has(t) && answerHits < 4) {
      score += W_ANSWER * weight;
      answerHits++;
    }
  }
  return { score, hits };
}

/** The best possible score for this question, used to normalise to 0..1. */
function ceiling(qTokens: string[]): number {
  const seen = new Set<string>();
  let total = 0;
  for (const t of qTokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    total += W_SOLO * idf(t);
  }
  return total || 1;
}

/**
 * HOW MUCH OF THE QUESTION WAS ACTUALLY UNDERSTOOD.
 *
 * One strong word out of five is weak evidence however rare that word is, and
 * this is what stops "what is the capital of Australia" being answered with
 * the list of destinations we work with: `australia` hits hard, `capital`
 * hits nothing, and half a question understood is not enough to speak with
 * confidence. A single-word question that matches its one word is untouched.
 */
/**
 * HOW MUCH OF THE QUESTION IS EVEN OUR SUBJECT.
 *
 * A word the knowledge base has never used anywhere — not in a keyword, a
 * question or an answer — is evidence the question is about something else.
 * "What is the capital of Australia" is the case this exists for: `australia`
 * is a real and strong signal, `capital` is a word we have never written, and
 * without this the destinations answer came back at 0.40 for a trivia
 * question. Half the sentence being foreign should cost it.
 *
 * Deliberately gentle — a typo or an unusual turn of phrase is also an
 * unknown word, and a student should not be handed off for spelling.
 */
function familiarity(qTokens: string[]): number {
  const unique = [...new Set(qTokens)];
  if (unique.length === 0) return 1;
  const strange = unique.filter((t) => !VOCABULARY.has(t)).length;
  return 1 - 0.45 * (strange / unique.length);
}

function coverage(hits: number, qTokens: number): number {
  if (qTokens === 0) return 0;
  const ratio = Math.min(1, hits / qTokens);
  /* The floor is what a question gets for matching ONE of its words. Set at
     0.45 it was too punishing — real questions carry filler the index has no
     reason to know ("does", "every", "whole"), and they were being demoted
     below the confident threshold despite ranking first by a clear margin.
     0.62 still halves the score of a one-word-in-five coincidence, which is
     the case this exists for. Both numbers are tuned against the check
     script: raise it and unknown questions start getting answered. */
  return 0.62 + 0.38 * ratio;
}

/* ---------- small talk ---------- */

/**
 * Words that are only ever pleasantries.
 *
 * A message is small talk when NOTHING is left after these are removed. That
 * is the whole test, and it is what keeps "hi, how much does a visa cost"
 * from being answered with "hello" — the greeting is stripped, `visa` and
 * `money` remain, and it goes to the matcher like any other question.
 *
 * Matched against raw normalised words rather than tokens, because most of
 * these are not stopwords and would otherwise survive into the matcher and
 * score against something.
 */
const HELLO = new Set([
  "hi", "hey", "hello", "helo", "namaste", "namaskar", "yo",
  "morning", "afternoon", "evening", "good", "greetings",
]);
const GRATEFUL = new Set([
  "thanks", "thank", "thankyou", "dhanyabad", "cheers", "appreciate", "grateful",
  "you",
]);
const FAREWELL = new Set(["bye", "goodbye", "night", "later", "see", "ya"]);

/* ---------- the public shape ---------- */

/** `declined` is abuse or spam — see assistantGuard. It never carries a
    matched entry, because such a message is never matched against one. */
export type ReplyKind =
  | "answer"
  | "maybe"
  | "handoff"
  | "greeting"
  | "declined";

export interface Suggestion {
  id: string;
  question: string;
}

export interface AssistantReply {
  kind: ReplyKind;
  /** What the assistant says. Always present, always ours. */
  text: string;
  /** A short second bubble, where the entry has one. See Faq.followUp. */
  followUp?: string;
  /** The entry it answered from, when it answered from one. */
  matched?: { id: string; question: string; topic: FaqTopic };
  /** A page worth opening, when the entry names one. */
  link?: { label: string; to: string };
  /** Other things it can answer — rendered as tappable chips. */
  suggestions: Suggestion[];
  /** True when the reply is telling them to speak to a person. */
  offerContact: boolean;
}

const asSuggestion = (f: Faq): Suggestion => ({ id: f.id, question: f.question });

/** The chips shown before anyone has typed anything. */
export function openers(): Suggestion[] {
  const wanted = [
    "how-to-apply", "which-test", "passport-visa-cost",
    "scholarships", "choose-programme", "work-while-studying",
  ];
  return FAQS.filter((f) => wanted.includes(f.id)).map(asSuggestion);
}

/** One entry by id — what a suggestion chip asks for, with no matching at all. */
export function byId(id: string): AssistantReply | null {
  const faq = FAQS.find((f) => f.id === id);
  if (!faq) return null;
  return {
    kind: "answer",
    text: faq.answer,
    followUp: faq.followUp,
    matched: { id: faq.id, question: faq.question, topic: faq.topic },
    link: faq.link,
    suggestions: neighbours(faq),
    offerContact: false,
  };
}

/** Two more from the same topic, so a chip leads somewhere rather than
    dead-ending. */
function neighbours(faq: Faq): Suggestion[] {
  return FAQS.filter((f) => f.topic === faq.topic && f.id !== faq.id)
    .slice(0, 2)
    .map(asSuggestion);
}

/**
 * The whole assistant, in one function.
 *
 * The tone is fixed here rather than in the client: every string a visitor
 * sees comes from this file or from data/faqs.ts, so the assistant cannot
 * develop a second personality in the front end.
 */
export function ask(question: string): AssistantReply {
  const trimmed = question.trim();

  /* LINKS COME OFF FIRST, and the rest of the message is kept. Somebody
     pasting a university's address alongside a real question ("is
     example.edu good for computing") should be answered on the question;
     only a message that is nothing but a link has nothing left to answer. */
  const { text: delinked, had: hadLink } = stripLinks(trimmed);
  const raw = delinked.trim();
  const qNorm = normalise(raw);

  if (hadLink && !qNorm) {
    return {
      kind: "declined",
      text: "I cannot open links, I am afraid. Tell me what you would like to know about that university or course and I will help from there.",
      suggestions: openers(),
      offerContact: true,
    };
  }

  /* THE GUARD RUNS BEFORE THE MATCHER, and that ordering is the point: an
     insult with the word "visa" in it must never come back with the visa
     answer. A declined message is never scored against the knowledge base. */
  const words = qNorm.split(" ").filter(Boolean);
  if (words.length && isAbusive(words, qNorm)) {
    return {
      kind: "declined",
      text: REFUSALS.abuse,
      suggestions: openers(),
      offerContact: false,
    };
  }
  if (raw.length > 0 && isSpammy(raw, words)) {
    return {
      kind: "declined",
      text: REFUSALS.spam,
      suggestions: openers(),
      offerContact: false,
    };
  }

  if (!qNorm) {
    return {
      kind: "greeting",
      text: "I am here whenever you are ready — ask me anything about studying abroad.",
      suggestions: openers(),
      offerContact: false,
    };
  }

  const qTokens = tokenise(raw);

  /* SMALL TALK IS WHAT IS LEFT WHEN NOTHING ELSE IS.
     The pleasantries are stripped, and only if the message is empty
     afterwards is it treated as one — so "hi" is greeted, and "hi, how much
     does a visa cost" goes to the matcher with `visa` and `money` intact. */
  /* `words` is the one computed above the guard — same normalised message. */
  const pleasantries = words.filter(
    (w) => HELLO.has(w) || GRATEFUL.has(w) || FAREWELL.has(w)
  );
  const onlyPleasantries =
    qTokens.length === 0 || pleasantries.length === words.length;

  if (onlyPleasantries) {
    if (words.some((w) => FAREWELL.has(w))) {
      return {
        kind: "greeting",
        text: "Take care, and good luck with it. We are here whenever you need us.",
        suggestions: [],
        offerContact: false,
      };
    }
    if (words.some((w) => GRATEFUL.has(w))) {
      return {
        kind: "greeting",
        text: "You are very welcome. Ask me anything else whenever you like — and if you would rather talk it through with a person, a counsellor is always happy to.",
        suggestions: openers(),
        offerContact: true,
      };
    }
    if (words.some((w) => HELLO.has(w))) {
      return {
        kind: "greeting",
        text: `Hello, and welcome. I can help with ${SCOPE} — where to go, what it costs, which test to sit, and what to expect once you land. What would you like to know?`,
        suggestions: openers(),
        offerContact: false,
      };
    }
    return {
      kind: "handoff",
      text: REFUSALS.empty,
      suggestions: openers(),
      offerContact: false,
    };
  }

  const max = ceiling(qTokens);
  const unique = new Set(qTokens).size;
  const familiar = familiarity(qTokens);
  const ranked = INDEX.map((e) => {
    const { score, hits } = scoreOne(e, qTokens, qNorm);
    return {
      faq: e.faq,
      confidence: (score / max) * coverage(hits, unique) * familiar,
    };
  }).sort((a, b) => b.confidence - a.confidence);

  const best = ranked[0];

  if (best && best.confidence >= CONFIDENT) {
    return {
      kind: "answer",
      text: best.faq.answer,
      followUp: best.faq.followUp,
      matched: {
        id: best.faq.id,
        question: best.faq.question,
        topic: best.faq.topic,
      },
      link: best.faq.link,
      suggestions: ranked.slice(1, 3).map((r) => asSuggestion(r.faq)),
      offerContact: false,
    };
  }

  if (best && best.confidence >= MAYBE) {
    return {
      kind: "maybe",
      text: "I am not certain I have understood — did you mean one of these? If not, a counsellor can answer properly.",
      suggestions: ranked.slice(0, 3).map((r) => asSuggestion(r.faq)),
      offerContact: true,
    };
  }

  return {
    kind: "handoff",
    text: `That one is outside what I cover, and I would rather point you at a person than guess. I can help with ${SCOPE} — for anything else, a counsellor can answer properly by message, by phone or in the office. Here are some things I do know about.`,
    suggestions: openers(),
    offerContact: true,
  };
}

/** Every question, grouped by topic — for a public FAQ page later, and for
    the checks. */
export function catalogue(): { topic: FaqTopic; questions: Suggestion[] }[] {
  const topics = [...new Set(FAQS.map((f) => f.topic))];
  return topics.map((topic) => ({
    topic,
    questions: FAQS.filter((f) => f.topic === topic).map(asSuggestion),
  }));
}

