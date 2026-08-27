/**
 * The partner institutions, and the destinations they sit in.
 *
 * Read by two places: the rotating logo grid on the home page
 * (components/UniversityPartners.tsx) and the partners page
 * (pages/UniversityPartners.tsx). Keeping one list means adding a partner is
 * one line, in one file, and both appear.
 *
 * TO ADD A PARTNER: drop the logo into client/public/universities/ and add
 * an entry below. Only `id`, `name` and `logo` are required — every other
 * field is optional and the page simply leaves out what is missing, so a
 * partner can go up the moment the logo arrives and be filled in later. A
 * logo file that does not exist falls back to the institution's name rather
 * than a broken image.
 *
 * NAMES ARE STILL PLACEHOLDERS. The ten logos below were supplied without
 * names attached, so they carry "University 1"…"University 10". Replace each
 * `name` with the real institution, and set `country` while you are there —
 * the country filter, the counts on the destination slides and the "six
 * countries" figure are all derived from that field, so they light up on
 * their own as it gets filled in. Nothing here asserts a country we have not
 * been told, which is why those counts read as zero today rather than wrong.
 */

export interface University {
  id: string;
  name: string;
  /** Path under client/public. */
  logo: string;
  /** Must match a `name` in DESTINATIONS to be counted and filtered. */
  country?: string;
  city?: string;
  /** The institution's own site. */
  url?: string;
  /** "Undergraduate", "Master's", "Pathway", "Research" … */
  levels?: string[];
  /** One line about why this partnership is useful to a student. */
  note?: string;
}

export const UNIVERSITIES: University[] = [
  { id: "uni-1", name: "University 1", logo: "/universities/uni-1.jpeg" },
  { id: "uni-2", name: "University 2", logo: "/universities/uni-2.jpeg" },
  { id: "uni-3", name: "University 3", logo: "/universities/uni-3.jpeg" },
  { id: "uni-4", name: "University 4", logo: "/universities/uni-4.jpeg" },
  { id: "uni-5", name: "University 5", logo: "/universities/uni-5.jpeg" },
  { id: "uni-6", name: "University 6", logo: "/universities/uni-6.jpeg" },
  { id: "uni-7", name: "University 7", logo: "/universities/uni-7.jpeg" },
  { id: "uni-8", name: "University 8", logo: "/universities/uni-8.jpeg" },
  { id: "uni-9", name: "University 9", logo: "/universities/uni-9.jpeg" },
  { id: "uni-10", name: "University 10", logo: "/universities/uni-10.jpeg" },
];

/**
 * The destinations the slideshow runs through.
 *
 * Photographs and blurbs are the ones the globe on the home page already
 * uses (components/Destinations.tsx), deliberately — the same country should
 * not be described two different ways on two pages. Order is the order the
 * slides run in; longitude order is what the globe uses and it reads well
 * here too, west to east.
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

/** How many partners we hold in each destination. Derived, never asserted. */
export function countByCountry(): Record<string, number> {
  return UNIVERSITIES.reduce<Record<string, number>>((acc, u) => {
    if (u.country) acc[u.country] = (acc[u.country] ?? 0) + 1;
    return acc;
  }, {});
}

/** Only the countries that actually have a partner attached to them. */
export function countriesWithPartners(): string[] {
  const counts = countByCountry();
  return DESTINATIONS.map((d) => d.name).filter((n) => counts[n] > 0);
}
