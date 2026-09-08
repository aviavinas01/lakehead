/**
 * The kinds of event Lakehead runs — editorial copy, not a schedule.
 *
 * THE EVENTS THEMSELVES ARE NO LONGER HERE. They live in the database and
 * are added from the admin (Events & news → Events); the /events page fetches
 * them. This file used to hold an `EVENTS` array with a note saying "to
 * announce one, add an entry below", and that instruction is now a trap: an
 * entry added here would be typechecked, committed, deployed and never
 * rendered. So the array is gone rather than left empty.
 *
 * What stays is the list below, and deliberately so. It is not a schedule and
 * does not claim to be one — it is what a visitor arriving at an empty page
 * reads to learn what they would be waiting for. It changes when the business
 * changes, roughly never, and putting it behind a form would mean maintaining
 * a CRUD screen for five paragraphs that belong in the repository with the
 * rest of the site's writing.
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
