import { env } from "../config/env.js";

/**
 * The Google rating shown in the site footer.
 *
 * Reads the summary only — the score and how many people left one — from the
 * Places API. Individual review text is deliberately not fetched: it costs a
 * pricier tier, caps out at five reviews, and the footer only shows the score.
 *
 * The result is cached in memory for CACHE_MS, so a busy site still makes at
 * most a couple of calls a day. Ratings move slowly; there is nothing to gain
 * from asking Google on every page load.
 */

export interface GoogleRating {
  rating: number;
  total: number;
  /** Link to the listing, so the footer can point people at the reviews */
  url?: string;
  /** True when the numbers came from Google rather than the fallback below */
  live: boolean;
}

const CACHE_MS = 12 * 60 * 60 * 1000;

/* Shown when the API key or place id is not configured, and whenever a call
   to Google fails — the footer always has something to display. */
const FALLBACK: GoogleRating = { rating: 4.9, total: 0, live: false };

let cache: { value: GoogleRating; at: number } | null = null;

async function fetchFromGoogle(): Promise<GoogleRating> {
  const { GOOGLE_MAPS_API_KEY: key, GOOGLE_PLACE_ID: placeId } = env;
  if (!key || !placeId) return FALLBACK;

  const url =
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
    `?fields=rating,userRatingCount,googleMapsUri`;

  const res = await fetch(url, { headers: { "X-Goog-Api-Key": key } });
  if (!res.ok) {
    throw new Error(`Places API responded ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
  };

  if (typeof data.rating !== "number") return FALLBACK;
  return {
    rating: data.rating,
    total: data.userRatingCount ?? 0,
    url: data.googleMapsUri,
    live: true,
  };
}

export const googleRatingService = {
  async get(): Promise<GoogleRating> {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

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
