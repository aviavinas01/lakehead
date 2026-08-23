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
export const FALLBACK_RATING: GoogleRating = {
  rating: 4.9,
  total: 0,
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
