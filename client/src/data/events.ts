/**
 * Upcoming events.
 *
 * EMPTY IS THE NORMAL STATE, not a bug. Lakehead runs events in bursts —
 * around intake deadlines, when a university sends a delegation, before a
 * departure season — and is quiet in between. So the page is built around
 * having nothing on, and the listing is what appears when something is
 * scheduled rather than the other way round.
 *
 * TO ANNOUNCE ONE: add an entry below. Only `id`, `title`, `when` and
 * `blurb` are required; everything else is optional and the card leaves out
 * what is missing. Delete it once it has happened — nothing here filters by
 * date, deliberately, because "when" is free text (a university visit is
 * often "late March", not a timestamp) and a page that silently hid an entry
 * on a date boundary would be harder to trust than one you empty by hand.
 *
 * When these outgrow hand-editing, this array is the shape a small `Event`
 * collection would return — the page reads it through one import.
 */

export type EventKind =
  | "Information session"
  | "University visit"
  | "Workshop"
  | "Mock test"
  | "Pre-departure";

export interface LakeheadEvent {
  id: string;
  title: string;
  /** Free text — "Saturday 14 March, 11am", "Late March", "Every Friday". */
  when: string;
  blurb: string;
  kind?: EventKind;
  /** Which office, or "Online". */
  where?: string;
  /** Where to sign up, if it is not simply the contact form. */
  registerUrl?: string;
}

/** Nothing scheduled. See the note above — this being empty is expected. */
export const EVENTS: LakeheadEvent[] = [];

/**
 * The kinds of thing that appear here when something is on. This is not a
 * schedule and does not claim to be one — it is here so that a visitor
 * arriving at an empty page learns what they would be waiting for.
 */
export const EVENT_KINDS: { name: string; text: string }[] = [
  {
    name: "Information sessions",
    text: "An hour on one destination — entry requirements, real costs, work rights, and what the visa actually asks of you. Open to anyone, no appointment, no obligation to become a client at the end of it.",
  },
  {
    name: "University visits",
    text: "When a partner institution sends someone to Kathmandu, we put them in a room with students. You get to ask an admissions officer your question directly instead of having us relay it.",
  },
  {
    name: "Test-preparation workshops",
    text: "Short, focused sessions on the parts of IELTS and PTE that most often cost people a band — writing task two, the speaking test, and reading under time.",
  },
  {
    name: "Mock test days",
    text: "A full-length sitting under exam conditions, marked and returned with a breakdown. The point is the debrief, not the score.",
  },
  {
    name: "Pre-departure briefings",
    text: "Held before each intake for students who are already going. Bank accounts, accommodation, what to carry, what to declare, and a room full of people flying the same month.",
  },
];
