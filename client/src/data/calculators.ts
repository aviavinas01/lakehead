/**
 * The five calculators on /resources, and the single source of truth for
 * them.
 *
 * Everything reads from here: the grid on /resources, the "Resources"
 * dropdown in the navbar, the crumb and heading on each calculator's own
 * page, and the rail of the other four at the foot of it. Adding a
 * calculator is an entry here plus a page component and a route — the three
 * places a new URL genuinely has to be named.
 *
 * THE ARITHMETIC IS NOT HERE. Every scale and conversion lives in
 * lib/grading.ts, with the note explaining why they are all in one file. This
 * one is names and routes.
 *
 * `head` is the page's big headline, split so the second half takes the red
 * accent the rest of the site uses — the same treatment as the destination
 * guides, and the reason each entry carries it rather than the pages
 * hard-coding a heading each.
 */

export interface Calculator {
  /** The path under /resources, and the id used for cross-links. */
  slug: string;
  /** Full name, as it appears in the navbar and on the hub. */
  name: string;
  /** The headline, in two halves: plain, then accented. */
  head: [string, string];
  /** One line on the hub card, and the meta description of the page. */
  blurb: string;
  /** The standfirst under the headline on the calculator's own page. */
  lead: string;
}

export const CALCULATORS: Calculator[] = [
  {
    slug: "ielts-band-score-calculator",
    name: "IELTS Band Score Calculator",
    head: ["IELTS ", "band score"],
    blurb:
      "Your four skill bands, and the overall band they actually add up to.",
    lead:
      "The overall band is not the average of your four scores — it is that average rounded to the nearest half band, which is why a 6.875 is a 7.0 and a 6.6 is a 6.5. Put your four bands in and see where you land.",
  },
  {
    slug: "pte-score-calculator",
    name: "PTE Score Calculator",
    head: ["PTE and ", "IELTS, compared"],
    blurb:
      "What a PTE Academic score is worth in IELTS bands, and the other way round.",
    lead:
      "Most students sitting PTE are deciding between it and IELTS, or working out whether a score they already hold clears a requirement written in the other test. This is Pearson's own concordance between the two, in both directions.",
  },
  {
    slug: "neb-to-gpa-calculator",
    name: "NEB to GPA Calculator",
    head: ["NEB grades ", "to GPA"],
    blurb:
      "Grade 11 and 12 letter grades and credit hours, weighted into a GPA.",
    lead:
      "Your NEB marksheet gives a letter grade against each subject and a credit-hour figure beside it. The GPA is those grade points weighted by those credit hours — not a plain average, which is why a five-credit subject moves it further than a three-credit one.",
  },
  {
    slug: "see-to-gpa-calculator",
    name: "SEE to GPA Calculator",
    head: ["SEE grades ", "to GPA"],
    blurb:
      "The same weighting, for a Secondary Education Examination marksheet.",
    lead:
      "SEE is graded on the same letter scale as the NEB exams — what differs is how many subjects you sat and the credit hours against each. Enter what your marksheet says and this weights them into a GPA.",
  },
  {
    slug: "gpa-to-percentage-calculator",
    name: "GPA to Percentage Calculator",
    head: ["GPA to ", "percentage"],
    blurb:
      "A GPA as a percentage, both directions, on whichever scale your transcript uses.",
    lead:
      "Application forms ask for a percentage far more often than Nepal's boards report one. There is no official conversion — this is the one institutions and universities use in practice, with the working shown so you can see exactly what it did.",
  },
];

/** One calculator by slug, for a page that wants its own entry. */
export const calculatorBySlug = (slug: string): Calculator | undefined =>
  CALCULATORS.find((c) => c.slug === slug);

/** The path a calculator lives at. Defined once so the routes, the navbar
    and the cross-links cannot disagree about where it is. */
export const calculatorPath = (slug: string): string => `/resources/${slug}`;
