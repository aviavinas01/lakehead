/**
 * The partner institutions, and the destinations they sit in.
 *
 * ------------------------------------------------------------------
 * MAINTAINED BY HAND, ON PURPOSE. There was briefly a Mongo collection and
 * an admin screen behind this; both are gone. A partner list changes a few
 * times a year, every entry is checked by a person before it goes up, and
 * the logos have to be cropped by hand anyway (see the note on `logo`) — so
 * the cost of a deploy per change is lower than the cost of a database, an
 * API, an admin form and a seed script standing behind ten rows.
 *
 * TO ADD A PARTNER:
 *   1. Crop the logo to its ink, leaving a small even margin, and drop it in
 *      client/public/universities/.
 *   2. Add an entry below.
 * Only `slug`, `name` and `logo` are required. Everything else is optional
 * and every page is built to leave out what is missing, so a partner can go
 * up the day the agreement is signed and be filled in later.
 *
 * NAMES ARE STILL PLACEHOLDERS. The ten logos were supplied without names
 * attached, so they carry "University 1"…"University 10". Replace each
 * `name` with the real institution and set `country` while you are there —
 * the filter chips and the per-destination counts are derived from that
 * field, so they light up on their own as it gets filled in. Nothing here
 * asserts a country we have not been told.
 * ------------------------------------------------------------------
 */

/** One extra link on a university's page: prospectus, apply, scholarships. */
export interface UniversityLink {
  label: string;
  url: string;
}

export interface University {
  /**
   * The address of its page (/study-abroad/universities/<slug> — see
   * universityPath) and its React key.
   *
   * WRITTEN OUT RATHER THAN DERIVED FROM THE NAME, so correcting a typo in a
   * name does not silently move a URL somebody has already linked to. Keep
   * it lowercase, hyphenated and unique.
   */
  slug: string;
  name: string;
  /**
   * Path under client/public.
   *
   * CROP IT TO THE LOGO FIRST. The originals here were 410x330 canvases with
   * the mark occupying 17-46% of the area — the rest was white baked into
   * the picture, so the browser was faithfully scaling a mostly-empty image
   * and no amount of CSS could make the mark look bigger. The files in
   * client/public/universities are trimmed; client/originals/universities
   * holds what was supplied. A new logo with its own white border will look
   * small on the wall for exactly the same reason.
   */
  logo: string;
  /** Must match a `name` in DESTINATIONS to be counted and filtered. */
  country?: string;
  city?: string;
  /** The institution's own site. */
  website?: string;
  /** Intake months, written out: "January", "September". */
  intakes?: string[];
  /** Prospectus, apply page, scholarships — whatever is worth linking. */
  links?: UniversityLink[];
}

export const UNIVERSITIES: University[] = [
  { slug: "university-1", name: "University 1", logo: "/universities/uni-1.jpeg" },
  { slug: "university-2", name: "University 2", logo: "/universities/uni-2.jpeg" },
  { slug: "university-3", name: "University 3", logo: "/universities/uni-3.jpeg" },
  { slug: "university-4", name: "University 4", logo: "/universities/uni-4.jpeg" },
  { slug: "university-5", name: "University 5", logo: "/universities/uni-5.jpeg" },
  { slug: "university-6", name: "University 6", logo: "/universities/uni-6.jpeg" },
  { slug: "university-7", name: "University 7", logo: "/universities/uni-7.jpeg" },
  { slug: "university-8", name: "University 8", logo: "/universities/uni-8.jpeg" },
  { slug: "university-9", name: "University 9", logo: "/universities/uni-9.jpeg" },
  { slug: "university-10", name: "University 10", logo: "/universities/uni-10.jpeg" },
];

/** One institution, for its own page. Undefined is a real answer — the page
    it feeds renders a "we could not find that" rather than throwing. */
/**
 * Where a partner's own page lives. Written once, here, because the list on
 * /study-abroad, the detail page's own links and the redirect from the old
 * /university-partners addresses all have to agree on it.
 */
export const universityPath = (slug: string) => `/study-abroad/universities/${slug}`;

/** The list of partners on the Study Abroad page — where every "back"
    link and the old /university-partners address now land. */
export const UNIVERSITIES_ANCHOR = "/study-abroad#universities";

export const universityBySlug = (slug: string): University | undefined =>
  UNIVERSITIES.find((u) => u.slug === slug);

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
 * DERIVED, NEVER ASSERTED. A partner with no `country` set contributes to no
 * count at all, so a tally is only ever as large as the entries that
 * actually name a place — the page shows nothing rather than a confident
 * zero, and the numbers appear on their own as the field gets filled in.
 */
export function countByCountry(): Record<string, number> {
  return UNIVERSITIES.reduce<Record<string, number>>((acc, u) => {
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
export function countriesWithPartners(): string[] {
  const counts = countByCountry();
  return DESTINATIONS.map((d) => d.name).filter((n) => counts[n] > 0);
}
