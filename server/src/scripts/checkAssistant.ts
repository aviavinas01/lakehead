// npx tsx src/scripts/checkAssistant.ts
//
// The assistant's accuracy, measured rather than assumed.
//
// Two things are being checked and they pull against each other. COVERAGE:
// does a real question, phrased the way a student would actually type it,
// reach the right answer? RESTRAINT: does a question we have no answer for
// get handed to a counsellor instead of being answered with the least-bad
// match? The confidence thresholds in assistant.service are tuned against
// this list, and a change to them should be re-run here before it ships.
//
// The phrasings below are deliberately messy — lowercase, no punctuation,
// misspelled, half-sentences — because that is how people type into a chat
// box at eleven at night.
import { ask, openers, byId, catalogue } from "../services/assistant.service.js";
import { FAQS } from "../data/faqs.js";

let fails = 0;

/* ---------- questions that must reach a specific answer ---------- */
const SHOULD_MATCH: [string, string][] = [
  ["why should i study abroad", "why-study-abroad"],
  ["is it worth going abroad to study", "why-study-abroad"],
  ["will studying abroad help me get a job", "employability"],
  ["how does this help my career", "employability"],
  ["when should i start the process", "when-to-start"],
  ["how early do i need to plan", "when-to-start"],
  ["my parents are worried how do i convince them", "talk-to-parents"],
  ["how do i tell my mother about this", "talk-to-parents"],
  ["how do i choose which course to study", "choose-programme"],
  /* Asking which country to PICK is the choosing question; asking which
     countries we cover is the destinations one. Both are below. */
  ["which country should i go to", "choose-programme"],
  ["what countries do you send students to", "countries"],
  ["can i transfer my credits from nepal", "credit-transfer"],
  ["will my credits count there", "credit-transfer"],
  ["what gpa do i need", "entry-requirements"],
  ["what marks are required", "entry-requirements"],
  ["i have a study gap of 3 years is it ok", "study-gap"],
  ["when are the intakes", "intakes"],
  ["which english test should i take", "which-test"],
  ["should i do ielts or pte", "which-test"],
  ["what band score do i need", "test-score-needed"],
  ["can i go without ielts", "test-waiver"],
  ["what is a passport", "what-is-passport"],
  ["when should i apply for my passport", "passport-when"],
  ["how long does a passport take", "passport-when"],
  ["what is a visa", "what-is-visa"],
  ["do i need a student visa", "what-is-visa"],
  ["are visas hard to get", "visa-difficulty"],
  ["where do i submit my visa application", "visa-where"],
  ["what if my visa gets rejected", "visa-refused"],
  ["what happens if visa is refused", "visa-refused"],
  ["can you guarantee my visa", "visa-guarantee"],
  ["is there a visa interview", "visa-interview"],
  ["do i need noc", "noc"],
  ["how much does a visa cost", "passport-visa-cost"],
  ["when do i pay the tuition fee", "tuition-when"],
  ["how much money do i need every month", "living-costs"],
  ["how much bank balance is required", "financial-proof"],
  ["are there any scholarships", "scholarships"],
  ["can i get a scholarship", "scholarships"],
  ["can i take an education loan", "education-loan"],
  ["do you charge any fees", "consultancy-fees"],
  ["is counselling free", "consultancy-fees"],
  ["how do i open a bank account there", "banking-abroad"],
  ["how do i apply", "how-to-apply"],
  ["what is the process", "how-to-apply"],
  ["what documents do i need", "documents"],
  ["what is a cas letter", "offer-letter"],
  ["what is an i20", "offer-letter"],
  ["how long does the whole thing take", "how-long-process"],
  ["how much luggage can i take", "luggage"],
  ["what is the baggage allowance", "luggage"],
  ["what should i pack", "packing"],
  ["do i need health insurance", "insurance"],
  ["is there a medical test", "medical-police"],
  ["what happens when i land", "arrival"],
  ["where will i stay", "accommodation"],
  ["who will help me when i am there", "support-abroad"],
  ["can i work part time while studying", "work-while-studying"],
  ["how many hours can i work", "work-while-studying"],
  ["can i stay after i graduate", "post-study-work"],
  ["is there pr after study", "post-study-work"],
  ["will i make friends there", "fitting-in"],
  ["i think i will feel homesick", "homesick"],
  ["can i come home in the holidays", "visit-home"],
  ["can my parents visit me", "family-visit"],
  ["can i take my wife with me", "dependents"],
  ["can i travel to other countries", "travel-other-countries"],
  ["what does lakehead do", "what-lakehead-does"],
  ["how can you help me", "what-lakehead-does"],
  ["where is your office", "where-are-you"],
  ["what is your address", "where-are-you"],
  ["which universities are you partnered with", "partner-universities"],
];

/* ---------- questions it must NOT answer ---------- */
const SHOULD_HANDOFF = [
  "what is the weather like in canada in december",
  "can you write my statement of purpose for me",
  "my brother was deported can he reapply",
  "what is the capital of australia",
  "i need a refund for my payment last month",
  "do you sell air tickets",
  "who won the football match",
  "what is my application status",
];

/* ---------- greetings ---------- */
const SMALL_TALK: [string, string][] = [
  ["hi", "greeting"],
  ["hello", "greeting"],
  ["namaste", "greeting"],
  ["thanks", "greeting"],
  ["thank you", "greeting"],
  ["bye", "greeting"],
  ["", "greeting"],
];

const ok = (cond: boolean, label: string) => {
  if (!cond) fails++;
  return `${cond ? "ok  " : "FAIL"}  ${label}`;
};

console.log("--- coverage: real phrasings reach the right answer ---");
let matched = 0;
const misses: string[] = [];
for (const [q, want] of SHOULD_MATCH) {
  const r = ask(q);
  const hit = r.kind === "answer" && r.matched?.id === want;
  if (hit) matched++;
  else misses.push(`      "${q}"  ->  ${r.kind}${r.matched ? ` (${r.matched.id})` : ""}, wanted ${want}`);
}
console.log(
  ok(
    matched === SHOULD_MATCH.length,
    `${matched}/${SHOULD_MATCH.length} phrasings answered correctly`
  )
);
misses.forEach((m) => console.log(m));

console.log("\n--- restraint: unknown questions are handed off, never guessed ---");
let restrained = 0;
for (const q of SHOULD_HANDOFF) {
  const r = ask(q);
  const good = r.kind === "handoff" || r.kind === "maybe";
  if (good) restrained++;
  else console.log(`      "${q}"  ->  answered with ${r.matched?.id} (should not have)`);
}
console.log(
  ok(restrained === SHOULD_HANDOFF.length, `${restrained}/${SHOULD_HANDOFF.length} handed off`)
);

/* A great many students here write English and Nepali in one sentence, and
   before the filler words and the handful of meaningful ones were indexed,
   every one of these read as half-foreign to the familiarity penalty and was
   handed off. A sentence with no English at all still hands off — to a
   counsellor who speaks it. */
console.log("\n--- Romanised Nepali, which is how a lot of people type here ---");
const NEPALI: [string, string][] = [
  ["scholorship kya hai", "scholarships"],
  ["visa kasari apply garne", "how-to-apply"],
  ["tution fee kati ho", "tuition-when"],
  ["documents ke ke chahincha", "documents"],
  ["ielts ko lagi kati score chahincha", "entry-requirements"],
  ["bidesh ma padhna kati kharcha lagcha", "living-costs"],
];
let nep = 0;
for (const [q, want] of NEPALI) {
  const r = ask(q);
  if (r.kind === "answer" && r.matched?.id === want) nep++;
  else console.log(`      "${q}"  ->  ${r.kind}${r.matched ? ` (${r.matched.id})` : ""}, wanted ${want}`);
}
console.log(ok(nep >= NEPALI.length - 1, `${nep}/${NEPALI.length} understood`));

console.log("\n--- small talk ---");
let talked = 0;
for (const [q, want] of SMALL_TALK) {
  const r = ask(q);
  if (r.kind === want) talked++;
  else console.log(`      "${q}"  ->  ${r.kind}, wanted ${want}`);
}
console.log(ok(talked === SMALL_TALK.length, `${talked}/${SMALL_TALK.length} greeted properly`));

/* ---------- abuse, spam, and the things that must NOT be mistaken for them
   ---------- */
console.log("\n--- abuse is declined, calmly and without matching ---");
const ABUSE = [
  "fuck you",
  "this is shit",
  "you are useless",
  "stupid bot you know nothing",
  "fuuuuuck this visa process",
  "chutiya",
];
let declined = 0;
for (const q of ABUSE) {
  const r = ask(q);
  const good = r.kind === "declined" && !r.matched;
  if (good) declined++;
  else console.log(`      "${q}"  ->  ${r.kind}${r.matched ? ` (${r.matched.id})` : ""}`);
}
console.log(ok(declined === ABUSE.length, `${declined}/${ABUSE.length} declined`));

console.log("\n--- spam is declined ---");
const SPAM = [
  "aaaaaaaaaaaaaaaaaa",
  "!!!!!!!!!!!!!!!!",
  "asdfghjklzxcvbnmqwerty",
  "1234567890 !!! 12345",
  "https://buy-cheap-stuff.example.com",
];
let spam = 0;
for (const q of SPAM) {
  const r = ask(q);
  if (r.kind === "declined") spam++;
  else console.log(`      "${q}"  ->  ${r.kind}`);
}
console.log(ok(spam === SPAM.length, `${spam}/${SPAM.length} declined`));

/* THE IMPORTANT HALF. A false positive tells a real student their real
   question is abuse or rubbish, which is far worse than letting nonsense
   through — nonsense scores nothing and is handed off politely anyway. */
console.log("\n--- and real questions are NEVER mistaken for either ---");
const INNOCENT: [string, string][] = [
  ["is lakehead a scam?", "not declined"],
  ["is this consultancy a fraud", "not declined"],
  ["i am from assam can i apply", "not declined"],
  ["my score was bad, is it useless to apply", "not declined"],
  ["what documents do i need", "documents"],
  ["is example.edu a good university for computing", "not declined"],
  ["HOW MUCH DOES A VISA COST", "passport-visa-cost"],
  ["how much does a visa cost???", "passport-visa-cost"],
  ["how much for tution fee", "tuition-when"],
  ["scholorship for collage", "scholarships"],
  ["what is my carrer option after study", "employability"],
];
let innocent = 0;
for (const [q, want] of INNOCENT) {
  const r = ask(q);
  const good =
    want === "not declined" ? r.kind !== "declined" : r.matched?.id === want;
  if (good) innocent++;
  else console.log(`      "${q}"  ->  ${r.kind}${r.matched ? ` (${r.matched.id})` : ""}, wanted ${want}`);
}
console.log(ok(innocent === INNOCENT.length, `${innocent}/${INNOCENT.length} handled correctly`));


console.log("\n--- shape of every reply ---");
console.log(ok(openers().length === 6, `${openers().length} opening suggestions`));
console.log(ok(byId("luggage")?.matched?.id === "luggage", "a suggestion chip answers directly"));
console.log(ok(byId("nope") === null, "an unknown id returns null rather than throwing"));
console.log(
  ok(
    FAQS.every((f) => byId(f.id)?.text === f.answer),
    "every entry is reachable by id"
  )
);
console.log(
  ok(
    new Set(FAQS.map((f) => f.id)).size === FAQS.length,
    `${FAQS.length} entries, all with unique ids`
  )
);
console.log(
  ok(
    FAQS.every((f) => f.keywords.length >= 3 && f.answer.length > 80),
    "every entry has keywords and a real answer"
  )
);
console.log(
  ok(
    !FAQS.some((f) => /kiec/i.test(f.answer + f.question + f.keywords.join(" "))),
    "no borrowed references left anywhere in the knowledge base"
  )
);
console.log(
  ok(
    !FAQS.some((f) => /\b32\s?(kg|kilogram)/i.test(f.answer)),
    "the wrong 32kg cabin-bag figure is gone"
  )
);
console.log(ok(catalogue().length >= 6, `${catalogue().length} topics in the catalogue`));

console.log("\n--- follow-ups ---");
console.log(
  ok(
    FAQS.filter((f) => f.followUp).length >= 20,
    `${FAQS.filter((f) => f.followUp).length} entries carry a follow-up line`
  )
);
console.log(
  ok(
    FAQS.every((f) => !f.followUp || f.followUp.length < 220),
    "every follow-up is a second breath, not a second answer"
  )
);
console.log(
  ok(
    ask("what is a visa").followUp !== undefined,
    "a follow-up survives the round trip through ask()"
  )
);
console.log(
  ok(
    ask("fuck off").kind === "declined" && ask("fuck off").followUp === undefined,
    "a declined message carries no follow-up"
  )
);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILING`);
process.exit(fails === 0 ? 0 : 1);
