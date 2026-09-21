import type { TestModule, TestProvider } from "../api/testBookings";

/**
 * The two IELTS booking forms, and everything that differs between them.
 *
 * They are the online versions of the paper declarations IDP and the British
 * Council each ask candidates to sign. The fields are the same on both
 * except one — the British Council form asks for an alternative email — and
 * the sentence the candidate signs names the test slightly differently. Both
 * of those live here, so the form page has no `if (provider === …)` in it.
 *
 * NAMES ONLY, NO LOGOS. Both marks belong to their organisations; the cards
 * say whose test it is in words.
 *
 * ONE PHOTOGRAPH PER PROVIDER, used twice: on its card on the Test Booking
 * page and across the top of its form. Drop the files in at these paths —
 *
 *   client/public/services/booking/idp.jpg
 *   client/public/services/booking/british-council.jpg
 *
 * — and they appear with no code change.
 *
 * NOT `services/test-booking/`, however natural that looks. A folder with
 * the same path as a page (/services/test-booking) is harmless on Vercel,
 * but a traditional web server such as cPanel's Apache answers a request
 * for a real folder itself — redirecting to add a slash and then refusing
 * to list it — so the Test Booking page would come back as a 403. The other
 * image folders keep the same distance (accommodation/ beside the
 * student-accommodation page). Until then both places show the
 * site's own placeholder (a pale tint on the card, the navy field every
 * other page hero falls back to), so nothing looks broken in the meantime.
 * A landscape photograph around 1600px wide covers both uses.
 */

export interface ProviderInfo {
  slug: TestProvider;
  /** Card title and page heading. */
  name: string;
  /** Who runs it, in the card's small print. */
  runBy: string;
  /** How the declaration names the test — copied from each paper form. */
  examPhrase: string;
  /** Only the British Council form has this line. */
  alternateEmail: boolean;
  /** Path under client/public — see the note at the top of this file. */
  image: string;
}

export const PROVIDERS: Record<TestProvider, ProviderInfo> = {
  idp: {
    slug: "idp",
    name: "IDP IELTS",
    runBy: "IELTS test run by IDP",
    examPhrase: "the IDP IELTS exam",
    alternateEmail: false,
    image: "/services/booking/idp.jpg",
  },
  "british-council": {
    slug: "british-council",
    name: "British Council IELTS",
    runBy: "IELTS test run by the British Council",
    examPhrase: "the IELTS exam",
    alternateEmail: true,
    image: "/services/booking/british-council.jpg",
  },
};

export const PROVIDER_LIST: ProviderInfo[] = [PROVIDERS.idp, PROVIDERS["british-council"]];

export const findProvider = (slug: string | undefined): ProviderInfo | undefined =>
  slug && slug in PROVIDERS ? PROVIDERS[slug as TestProvider] : undefined;

export const bookingPath = (slug: TestProvider) => `/services/test-booking/${slug}`;

export const MODULES: { value: TestModule; label: string; hint: string }[] = [
  { value: "academic", label: "Academic", hint: "For university study" },
  { value: "general-training", label: "General Training", hint: "For work or migration" },
];

export const moduleLabel = (m: TestModule) => MODULES.find((x) => x.value === m)?.label ?? m;

/**
 * SUGGESTIONS, not a list of test centres. The field accepts any city — a
 * provider opens and closes centres without telling us, and a fixed list
 * that was wrong would be worse than none. These only save typing for the
 * common answers; the counsellor confirms the venue either way.
 */
export const CITY_SUGGESTIONS = [
  "Kathmandu",
  "Lalitpur",
  "Pokhara",
  "Chitwan",
  "Butwal",
  "Biratnagar",
  "Itahari",
  "Dharan",
  "Birtamode",
  "Nepalgunj",
  "Dhangadhi",
];

/** Must match SIGNATURE_MAX_BYTES and SIGNATURE_MIMES on the server. */
export const SIGNATURE_MAX_BYTES = 2 * 1024 * 1024;
export const SIGNATURE_TYPES = ["image/jpeg", "image/png", "image/webp"];
