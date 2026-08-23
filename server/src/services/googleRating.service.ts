import { env } from "../config/env.js";

/**
 * The Google rating and reviews for the consultancy: the score in the site
 * footer, and the review cards above it.
 *
 * Both come from one call to the Places API, because that is the only call
 * either needs — the response is cached in memory for CACHE_MS, so a busy
 * site makes a couple of requests a day rather than one per visitor.
 * Ratings and reviews move slowly; there is nothing to gain from asking
 * Google on every page load.
 *
 * Two things worth knowing before you turn this on in production:
 *
 *  - The API returns at most FIVE reviews, and which five is Google's
 *    choice, not ours. There is no way to page through the rest. A wall of
 *    every review needs a third-party widget that scrapes them, or reviews
 *    kept in our own database.
 *  - Asking for `reviews` moves the call into a pricier billing tier than
 *    the score alone. At two calls a day that is immaterial, but it is the
 *    reason the cache matters: drop CACHE_MS and the bill follows.
 *
 * Google's terms require reviews to be shown as they come back, with the
 * author's name and photo and a link to their profile — so nothing here
 * filters or reorders them, and the client renders the attribution.
 */

export interface GoogleReview {
  /** Last segment of the resource name — stable enough for a React key */
  id: string;
  author: string;
  photo?: string;
  profileUrl?: string;
  rating: number;
  text: string;
  /** Google's own wording, e.g. "a month ago" */
  relativeTime: string;
}

export interface GoogleRating {
  rating: number;
  total: number;
  /** Link to the listing, so the page can point people at the reviews */
  url?: string;
  /** True when the numbers came from Google rather than the fallback below */
  live: boolean;
  reviews: GoogleReview[];
}

const CACHE_MS = 12 * 60 * 60 * 1000;

/* A lookup that did not come back live — no key yet, billing not enabled,
   Google having a bad day — is held for minutes rather than hours. Without
   this, the first failed call would pin the fallback in memory for half a
   day, so fixing the configuration would appear to do nothing until someone
   restarted the server. */
const RETRY_MS = 5 * 60 * 1000;

/* Shown when the API key or place id is not configured, and whenever a call
   to Google fails — the footer always has something to display. With no
   reviews the section above the footer renders nothing at all. */
const FALLBACK: GoogleRating = { rating: 4.9, total: 0, live: false, reviews: [] };

let cache: { value: GoogleRating; at: number } | null = null;

interface PlaceReview {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
}

function toReview(raw: PlaceReview, index: number): GoogleReview[] {
  /* `text` is Google's translation into the request language; originalText
     is what the reviewer actually wrote. Prefer the translated one and fall
     back, and drop anything with no words in it — a rating on its own has
     nothing to show on a card. */
  const text = (raw.text?.text ?? raw.originalText?.text ?? "").trim();
  if (!text) return [];

  const author = raw.authorAttribution?.displayName?.trim();
  if (!author) return [];

  return [
    {
      id: raw.name?.split("/").pop() ?? `review-${index}`,
      author,
      photo: raw.authorAttribution?.photoUri,
      profileUrl: raw.authorAttribution?.uri,
      rating: typeof raw.rating === "number" ? raw.rating : 5,
      text,
      relativeTime: raw.relativePublishTimeDescription ?? "",
    },
  ];
}

async function fetchFromGoogle(): Promise<GoogleRating> {
  const { GOOGLE_MAPS_API_KEY: key, GOOGLE_PLACE_ID: placeId } = env;
  if (!key || !placeId) return FALLBACK;

  const url =
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
    `?fields=rating,userRatingCount,googleMapsUri,reviews`;

  const res = await fetch(url, { headers: { "X-Goog-Api-Key": key } });
  if (!res.ok) {
    throw new Error(`Places API responded ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: PlaceReview[];
  };

  if (typeof data.rating !== "number") return FALLBACK;
  return {
    rating: data.rating,
    total: data.userRatingCount ?? 0,
    url: data.googleMapsUri,
    live: true,
    reviews: (data.reviews ?? []).flatMap(toReview),
  };
}

export const googleRatingService = {
  async get(): Promise<GoogleRating> {
    const ttl = cache?.value.live ? CACHE_MS : RETRY_MS;
    if (cache && Date.now() - cache.at < ttl) return cache.value;

    try {
      const value = await fetchFromGoogle();
      cache = { value, at: Date.now() };
      return value;
    } catch (err) {
      console.error("Google rating lookup failed:", err);
      /* Keep serving the last good value if there is one, so a blip at
         Google's end never blanks out the footer. */
      const value = cache?.value ?? FALLBACK;
      cache = { value, at: Date.now() };
      return value;
    }
  },
};
