/**
 * The numbers behind /resources — every score scale and conversion the
 * calculators use, in one file, with nothing about them in a component.
 *
 * ------------------------------------------------------------------
 * WHY THEY ARE ALL HERE.
 *
 * The rest of this site is careful never to publish a figure with a shelf
 * life — see the note at the top of data/tests.ts, which is why no test page
 * quotes a score, a fee or a validity period. A calculator cannot follow
 * that rule: a number IS the answer it gives. So it follows the next best
 * one instead. Every scale below is stated once, in the open, with what it
 * is and where it comes from written beside it, and every page that uses one
 * SHOWS ITS WORKING to the student — the formula, and the table it applied.
 * Nobody should have to trust an answer from this site they cannot check.
 *
 * REVIEW THESE. Pearson revises its concordance, and Nepal's boards revise
 * their letter grading — the NEB and SEE scales below have both changed
 * within the last few years. When one moves, it moves HERE and every
 * calculator, every on-page table and every worked example follows, because
 * none of them carry a copy. If you cannot confirm a scale against the body
 * that sets it, that is a reason to take the calculator down, not a reason
 * to leave a stale table running.
 * ------------------------------------------------------------------
 */

/* ============================================================
   IELTS
   ============================================================ */

/** Every band a skill can be reported at: 0 to 9 in half-band steps. */
export const IELTS_BAND_STEPS: number[] = Array.from(
  { length: 19 },
  (_, i) => i * 0.5
);

/**
 * The overall band from the four skill bands.
 *
 * The rule IELTS publishes is stated as three cases — an average ending in
 * .25 rounds up to the next half band, one ending in .75 rounds up to the
 * next whole band, and anything else rounds to the nearest of the two. All
 * three fall out of rounding to the nearest half, which is what this does:
 * 6.25 becomes 6.5, 6.75 becomes 7.0, 6.1 becomes 6.0, 6.4 becomes 6.5.
 *
 * NO FLOATING-POINT GUARD IS NEEDED, unusually. Four half-band scores sum to
 * a multiple of 0.5 and divide to a multiple of 0.125, and both are exact in
 * binary — so the .25 and .75 cases the rule turns on land precisely on the
 * boundary rather than a hair below it. Feed this a value off that lattice
 * and that stops being true.
 */
export const ieltsOverall = (skills: number[]): number => {
  const mean = skills.reduce((a, b) => a + b, 0) / skills.length;
  return Math.round(mean * 2) / 2;
};

/* ============================================================
   PTE Academic and IELTS
   ============================================================ */

/**
 * Pearson's published concordance between PTE Academic overall scores and
 * IELTS bands.
 *
 * IT IS A COMPARISON, NOT A CONVERSION, and the page using it says so. The
 * two tests are scored differently and by different people; this table says
 * what score on one broadly corresponds to what band on the other, which is
 * useful for deciding which test to sit and useless as an argument with an
 * admissions officer. Every university sets its own requirement in whichever
 * test it asks for, and a concordance has never persuaded one of anything.
 *
 * Ordered high to low — pteToIelts walks it in this order and stops.
 */
export const PTE_IELTS_CONCORDANCE: { ielts: number; pte: number }[] = [
  { ielts: 9.0, pte: 89 },
  { ielts: 8.5, pte: 86 },
  { ielts: 8.0, pte: 79 },
  { ielts: 7.5, pte: 73 },
  { ielts: 7.0, pte: 65 },
  { ielts: 6.5, pte: 58 },
  { ielts: 6.0, pte: 50 },
  { ielts: 5.5, pte: 42 },
  { ielts: 5.0, pte: 36 },
  { ielts: 4.5, pte: 29 },
];

/** The lowest PTE Academic overall score the table reaches. */
export const PTE_FLOOR =
  PTE_IELTS_CONCORDANCE[PTE_IELTS_CONCORDANCE.length - 1].pte;

/**
 * The IELTS band a PTE overall score reaches — the highest band whose
 * concordance score the result meets or beats.
 *
 * THE BAND IS THE ONE REACHED, not the nearest one. A PTE 64 is a 6.5 here
 * and not a 7.0, because 65 is what the table puts against 7.0, and rounding
 * a student up to a band they did not reach is the one error on this page
 * that could cost somebody an application fee.
 *
 * Returns null below the bottom of the table, which the page renders as
 * "below 4.5" rather than as a number the table cannot support.
 */
export const pteToIelts = (pte: number): number | null =>
  PTE_IELTS_CONCORDANCE.find((r) => pte >= r.pte)?.ielts ?? null;

/** The PTE score against an IELTS band, or null for a band off the table. */
export const ieltsToPte = (ielts: number): number | null =>
  PTE_IELTS_CONCORDANCE.find((r) => r.ielts === ielts)?.pte ?? null;

/* ============================================================
   Nepal — NEB and SEE letter grading
   ============================================================ */

export interface NepalGrade {
  /** The letter as it appears on the marksheet. */
  grade: string;
  /** Its grade point on the four-point scale. */
  point: number;
  /** The marks band it is awarded for, for the table shown on the page. */
  range: string;
}

/**
 * The letter grades and grade points used by the National Examinations Board
 * for grades 11 and 12, and by the Secondary Education Examination.
 *
 * ONE SCALE, TWO EXAMS. The letters and their points are the same for both;
 * what differs is how many subjects a student sits and the credit hours
 * against each, which is why the two calculators differ only in what they
 * start you with. If the boards ever diverge, split this into two constants
 * rather than adding a flag — a calculator quietly applying the other exam's
 * scale is not a fault anybody would spot from the answer.
 *
 * NG is "non-graded" and carries no grade point. A subject graded NG has not
 * been passed, so it contributes nothing to the total while still counting
 * its credit hours against the divisor — which is what pulls the GPA down,
 * and is correct rather than an oversight.
 */
export const NEPAL_GRADES: NepalGrade[] = [
  { grade: "A+", point: 4.0, range: "90 to 100%" },
  { grade: "A", point: 3.6, range: "80 to below 90%" },
  { grade: "B+", point: 3.2, range: "70 to below 80%" },
  { grade: "B", point: 2.8, range: "60 to below 70%" },
  { grade: "C+", point: 2.4, range: "50 to below 60%" },
  { grade: "C", point: 2.0, range: "40 to below 50%" },
  { grade: "D", point: 1.6, range: "35 to below 40%" },
  { grade: "NG", point: 0, range: "below 35%" },
];

export const gradePoint = (grade: string): number =>
  NEPAL_GRADES.find((g) => g.grade === grade)?.point ?? 0;

/** One row of a marksheet, as the GPA calculators hold it. */
export interface GradeRow {
  /** Stable across re-renders, so React keys and inputs do not swap places. */
  id: number;
  /** Optional — the arithmetic never reads it, the student does. */
  subject: string;
  /** A letter from NEPAL_GRADES, or "" for a row nobody has filled in yet. */
  grade: string;
  /** Credit hours, as printed on the marksheet. */
  credit: number;
}

/**
 * The weighted grade point average: credit hours times grade point, summed,
 * over total credit hours.
 *
 * A ROW IS ONLY COUNTED ONCE IT HAS BOTH A GRADE AND CREDIT HOURS, and the
 * distinction that matters is between an unfilled row and a failed subject.
 * "" is nothing chosen; NG is a real grade worth no points, and it DOES
 * count — its credit hours stay in the divisor while contributing nothing
 * above the line, which is exactly how a failed subject pulls a GPA down.
 * Treating the empty row the same way would have every calculator here open
 * on a GPA of zero, which looks broken and, on these pages, is also a real
 * and alarming answer. An emptied credit box is likewise a student mid-edit
 * rather than a subject worth nothing.
 *
 * With no usable row at all this returns null and the page shows its waiting
 * state, which is the honest thing to show before anything has been entered.
 */
export const weightedGpa = (rows: GradeRow[]): number | null => {
  const usable = rows.filter(
    (r) => r.grade !== "" && Number.isFinite(r.credit) && r.credit > 0
  );
  if (usable.length === 0) return null;
  const credits = usable.reduce((a, r) => a + r.credit, 0);
  if (credits <= 0) return null;
  const points = usable.reduce((a, r) => a + r.credit * gradePoint(r.grade), 0);
  return points / credits;
};

/**
 * The letter a GPA sits at, for the "that is roughly a B+" line.
 *
 * The bands are read downwards, so a GPA meets a letter when it reaches that
 * letter's grade point — 3.4 has passed 3.2 and not 3.6, and is a B+. A GPA
 * below the lowest graded point (1.6, D) is not a pass at any letter, and
 * comes back as NG rather than as the nearest one above it.
 */
export const gradeForGpa = (gpa: number): NepalGrade | null => {
  if (!Number.isFinite(gpa)) return null;
  return (
    NEPAL_GRADES.find((g) => g.point > 0 && gpa >= g.point) ??
    NEPAL_GRADES[NEPAL_GRADES.length - 1]
  );
};

/* ============================================================
   GPA and percentage
   ============================================================ */

/**
 * THERE IS NO OFFICIAL GPA-TO-PERCENTAGE CONVERSION IN NEPAL, and the page
 * says so plainly. Neither the NEB nor the SEE publishes one — the boards
 * report a grade and a grade point and stop there.
 *
 * Dividing by the scale and multiplying by 100 is what institutions,
 * consultancies and most universities abroad use in practice: on the
 * four-point scale the boards use, that is the familiar "GPA times 25", and
 * it is the figure a student will have been given everywhere else they have
 * asked.
 *
 * It is an approximation and the page treats it as one. The exact percentage
 * behind a letter grade is a range rather than a point, and an admitting
 * university will apply its own conversion whatever this says.
 */
export const GPA_SCALES = [4, 5, 10] as const;
export type GpaScale = (typeof GPA_SCALES)[number];

/** The four-point scale is the one the Nepali boards use. */
export const DEFAULT_GPA_SCALE: GpaScale = 4;

/** GPA to percentage — 3.6 on a four-point scale is 90%. */
export const gpaToPercent = (gpa: number, scale: GpaScale): number =>
  (gpa / scale) * 100;

/** ...and back, for the second direction on the same page. */
export const percentToGpa = (percent: number, scale: GpaScale): number =>
  (percent / 100) * scale;

/**
 * A computed figure at `places` decimals with no trailing zeros — 3.6 rather
 * than 3.60, and 90 rather than 90.00. Every result on these pages goes
 * through it, so they all round the same way.
 */
export const tidy = (n: number, places = 2): string =>
  Number(n.toFixed(places)).toString();
