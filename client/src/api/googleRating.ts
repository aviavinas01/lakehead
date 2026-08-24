import api from "./client";
import type { GoogleRating } from "../types/api";

/**
 * The Google rating is wanted in two places on every page — the score in the
 * footer and the review cards above it — so the request is made once and the
 * promise is shared. Without this the two would each fetch it on every
 * navigation, for one answer the server is caching anyway.
 *
 * The static score is what shows before Google answers, and if the lookup
 * fails: the footer should never sit empty waiting on a third party.
 */
/**
 * Lakehead Education on Google Maps. The footer's rating links straight here,
 * and it stands in for the listing URL whenever Google has not answered — so
 * the link works before the Places API is configured and on any day the
 * lookup fails. The tracking parameters Google appends when you copy the link
 * from the address bar are dropped; the place is identified by the `data=`
 * segment in the path, which is the part that has to survive.
 */
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Lakehead+Education/@27.7042975,85.3242905,826m/" +
  "data=!3m2!1e3!4b1!4m6!3m5!1s0x39eb1906acd38af5:0x706549429604a77d!8m2!3d27.7042975!4d85.3268654!16s%2Fg%2F11q9qyp0jc";

export const FALLBACK_RATING: GoogleRating = {
  rating: 4.9,
  total: 0,
  url: GOOGLE_MAPS_URL,
  live: false,
  reviews: [],
};

let inFlight: Promise<GoogleRating> | null = null;

export function fetchGoogleRating(): Promise<GoogleRating> {
  if (!inFlight) {
    inFlight = api
      .get<{ rating: GoogleRating }>("/google-rating", { quiet: true })
      .then(({ data }) => ({ ...FALLBACK_RATING, ...data.rating }))
      .catch(() => {
        /* Let the next caller try again rather than caching the failure */
        inFlight = null;
        return FALLBACK_RATING;
      });
  }
  return inFlight;
}
