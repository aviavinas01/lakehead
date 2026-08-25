/**
 * The tests we prepare students for, and the single source of truth for them.
 *
 * Everything reads from here: the grid on /services/test-preparation, each
 * test's own page, the nested flyout under Test Preparation in the navbar,
 * and the routes behind all of it. Adding a test is one entry.
 *
 * IMAGES are referenced but not yet supplied. Drop a file at the path each
 * entry names into client/public/tests/ and it appears; until then the card
 * shows a tinted panel rather than a broken image.
 *
 * The copy is deliberately about what the test is FOR and how we prepare you
 * — never scores, fees or validity periods. Those change on the test board's
 * schedule, not ours, and a stale number on a prep page is the fastest way
 * to lose a student's trust. Fuller per-test content is coming; keep that
 * rule when you write it.
 */

export interface Test {
  slug: string;
  /** Short name, as students say it */
  name: string;
  /** What the letters stand for */
  full: string;
  /** One line for the card */
  blurb: string;
  /** Opening paragraph of the test's own page */
  intro: string;
  /** client/public/tests/<file> — supply manually */
  image: string;
}

export const TESTS: Test[] = [
  {
    slug: "ielts",
    name: "IELTS",
    full: "International English Language Testing System",
    blurb: "The most widely accepted English test, and the one most of our students sit.",
    intro:
      "IELTS is the English test most universities and visa routes will accept, which makes it the default choice for a lot of students. There are two versions — Academic for university study, General Training for migration — and picking the wrong one is a surprisingly common and expensive mistake.",
    image: "/tests/ielts.jpg",
  },
  {
    slug: "toefl",
    name: "TOEFL",
    full: "Test of English as a Foreign Language",
    blurb: "English proficiency, especially strong for universities in the United States.",
    intro:
      "TOEFL is entirely computer-based and leans academic — the reading and listening come from lecture-style material rather than everyday conversation. It is particularly well recognised in the US, so it is worth checking which your shortlist prefers before you book anything.",
    image: "/tests/toefl.jpg",
  },
  {
    slug: "pte",
    name: "PTE",
    full: "Pearson Test of English",
    blurb: "Computer-marked, quick results, and popular for Australian applications.",
    intro:
      "PTE is marked by computer rather than by a person, which means results come back fast and consistently. Students who find the face-to-face speaking section of other tests nerve-wracking often do noticeably better here, simply because they are talking to a microphone.",
    image: "/tests/pte.jpg",
  },
  {
    slug: "duolingo",
    name: "Duolingo",
    full: "Duolingo English Test",
    blurb: "Sat from home, results in days, and accepted by a growing list of universities.",
    intro:
      "The Duolingo English Test is taken online from home, costs considerably less than the alternatives, and turns results around quickly. Acceptance is growing but is still not universal, so confirm your specific institutions take it before you rely on it.",
    image: "/tests/duolingo.jpg",
  },
  {
    slug: "gre",
    name: "GRE",
    full: "Graduate Record Examinations",
    blurb: "For master's and doctoral admission across a wide range of subjects.",
    intro:
      "The GRE is asked for by graduate programmes across most disciplines, not just one field. It tests verbal reasoning, quantitative reasoning and analytical writing — which is to say it tests how you think under time pressure rather than what you happen to know.",
    image: "/tests/gre.jpg",
  },
  {
    slug: "gmat",
    name: "GMAT",
    full: "Graduate Management Admission Test",
    blurb: "The business school test — MBAs and management master's.",
    intro:
      "The GMAT is built for business and management programmes, with a heavy emphasis on data reasoning and problem solving. Some schools now accept the GRE instead, so it is worth checking whether you actually need this one before committing months to it.",
    image: "/tests/gmat.jpg",
  },
  {
    slug: "sat",
    name: "SAT",
    full: "Scholastic Assessment Test",
    blurb: "Undergraduate admission in the United States.",
    intro:
      "The SAT is for students applying to US universities straight from school, covering reading, writing and maths. Plenty of institutions have gone test-optional in recent years — but a strong score still helps, particularly where scholarships are involved.",
    image: "/tests/sat.jpg",
  },
  {
    slug: "act",
    name: "ACT",
    full: "American College Testing",
    blurb: "The other US undergraduate test, with a science reasoning section.",
    intro:
      "The ACT does the same job as the SAT and US universities treat the two equally, so you only need one. It runs slightly faster, and it adds a science reasoning section — students who are comfortable reading charts under time pressure often prefer it.",
    image: "/tests/act.jpg",
  },
];

/** Used by the detail route; undefined for an unknown slug. */
export const findTest = (slug?: string): Test | undefined =>
  TESTS.find((t) => t.slug === slug);
