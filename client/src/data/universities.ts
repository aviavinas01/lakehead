import type { University } from "../types/api";

/**
 * The destinations the partner slideshow runs through, and the two helpers
 * that count partners across them.
 *
 * ------------------------------------------------------------------
 * THE PARTNER LIST ITSELF IS NO LONGER HERE. It used to be: ten hard-coded
 * entries that a developer edited and a deploy published. Partners are added
 * several times a year by the office, so they are a collection now, managed
 * in the admin at /admin/universities and fetched from /universities. See
 * server/src/models/University.ts.
 *
 * WHAT STAYS IS THE PHOTOGRAPHY. A destination slide is a picture, a blurb
 * and a link to that country's guide — none of which the office edits, all
 * of which are shared with the globe on the home page, and none of which
 * belong in a database keyed to individual institutions. The two are joined
 * by the `country` field on each university matching a `name` below.
 * ------------------------------------------------------------------
 */

export interface PartnerDestination {
  name: string;
  /** Photograph under client/public. */
  image: string;
  blurb: string;
  /** The destination guide. */
  to: string;
  /** The word set at display size on the slide, if it differs from `name`. */
  display?: string;
}

export const DESTINATIONS: PartnerDestination[] = [
  {
    name: "Canada",
    image: "/canada.jpg",
    blurb: "Affordable tuition, applied teaching, and the clearest path to residency of any destination we work with.",
    to: "/study-in-canada",
  },
  {
    name: "USA",
    image: "/usa.jpg",
    blurb: "The deepest bench of research universities anywhere, and OPT work rights waiting on the other side of the degree.",
    to: "/study-in-usa",
    display: "United States",
  },
  {
    name: "UK",
    image: "/uk.jpg",
    blurb: "One-year master's degrees and a two-year graduate visa — the fastest route from Kathmandu to a foreign qualification.",
    to: "/study-in-uk",
    display: "United Kingdom",
  },
  {
    name: "South Korea",
    image: "/southkorea.jpg",
    blurb: "Scholarship-rich programmes taught in English, at universities most students here have never thought to look at.",
    to: "/study-in-south-korea",
  },
  {
    name: "Australia",
    image: "/australia.jpg",
    blurb: "Strong post-study work rights in every state, and the largest Nepali student community of any destination.",
    to: "/study-in-australia",
  },
  {
    name: "New Zealand",
    image: "/newzealand.jpg",
    blurb: "Small class sizes, a visa system that behaves predictably, and a country that is genuinely pleasant to be a student in.",
    to: "/study-in-new-zealand",
  },
];

/**
 * How many partners we hold in each destination.
 *
 * DERIVED, NEVER ASSERTED, and that rule is why this takes the list rather
 * than reading a global. A partner with no `country` set contributes to no
 * count at all, so a tally is only ever as big as the records that actually
 * name a place — the page shows nothing rather than a confident zero, and
 * the numbers appear on their own as the field gets filled in.
 */
export function countByCountry(
  universities: University[]
): Record<string, number> {
  return universities.reduce<Record<string, number>>((acc, u) => {
    if (u.country) acc[u.country] = (acc[u.country] ?? 0) + 1;
    return acc;
  }, {});
}

/**
 * Only the destinations that actually have a partner attached.
 *
 * In DESTINATIONS order rather than alphabetically, so the filter chips run
 * in the same sequence as the slides above them.
 */
export function countriesWithPartners(universities: University[]): string[] {
  const counts = countByCountry(universities);
  return DESTINATIONS.map((d) => d.name).filter((n) => counts[n] > 0);
}
