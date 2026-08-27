import { useEffect, useMemo, useState } from "react";
import { fetchGoogleRating } from "../api/googleRating";
import { useYouTubeFeed } from "./useYouTubeFeed";
import { WRITTEN, SOCIAL } from "../data/testimonials";
import type { ReviewSource, SocialPlatform } from "../data/testimonials";
import type { GoogleRating } from "../types/api";

/**
 * Flattens the four review sources into one list the wall can render.
 *
 * The sources have almost nothing in common — Google gives a score and a
 * relative date, YouTube gives a video id and a title, the curated entries
 * give a destination and no date at all — so rather than teach the card
 * component about each of them, everything is normalised to `WallItem` here
 * and the card renders whichever fields turned out to be present.
 *
 * Two of the four are network-backed and both fail soft: Google resolves to
 * its static fallback with an empty `reviews` array, YouTube to an empty
 * list. Either way the wall still has the curated entries, so the page is
 * never empty — which is the reason it is safe to ship before the Places API
 * key and the testimonials playlist are configured.
 *
 * Order is deliberate rather than chronological. Only Google carries a
 * usable date (a relative string, which cannot be sorted anyway), so sorting
 * by recency is not available; interleaving the sources instead means the
 * first screenful of the wall shows all four kinds of card rather than seven
 * written ones followed by everything else.
 */

export interface WallItem {
  id: string;
  source: ReviewSource;
  /** Set for social items only. */
  platform?: SocialPlatform;
  author: string;
  handle?: string;
  avatar?: string;
  /** Out of 5, where the source has one. */
  rating?: number;
  /** The review body. Empty for video items, which show a title instead. */
  text: string;
  /** Free text — "3 months ago", "Posted in March". */
  when?: string;
  destination?: string;
  /** Video items only: the 11-character YouTube id. */
  videoId?: string;
  videoTitle?: string;
  /** Where the card links out to, if anywhere. */
  href?: string;
}

/** Round-robins the source lists together so the wall opens mixed. */
function interleave(lists: WallItem[][]): WallItem[] {
  const out: WallItem[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      if (i < list.length) out.push(list[i]);
    }
  }
  return out;
}

export function useReviewWall() {
  const [google, setGoogle] = useState<GoogleRating>();
  const videos = useYouTubeFeed("testimonials");

  useEffect(() => {
    let cancelled = false;
    fetchGoogleRating().then((data) => {
      if (!cancelled) setGoogle(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo<WallItem[]>(() => {
    const written: WallItem[] = WRITTEN.map((w) => ({
      id: w.id,
      source: "written",
      author: w.name,
      avatar: w.image,
      rating: w.rating,
      text: w.quote,
      when: w.when,
      destination: w.country,
    }));

    const fromGoogle: WallItem[] = (google?.reviews ?? []).map((r) => ({
      id: `g-${r.id}`,
      source: "google",
      author: r.author,
      avatar: r.photo,
      rating: r.rating,
      text: r.text,
      when: r.relativeTime,
      href: r.profileUrl,
    }));

    const fromVideo: WallItem[] = videos.map((v) => ({
      id: `v-${v.id}`,
      source: "video",
      author: v.author,
      text: "",
      videoId: v.id,
      videoTitle: v.title,
      when: new Date(v.publishedAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    }));

    const social: WallItem[] = SOCIAL.map((s) => ({
      id: s.id,
      source: "social",
      platform: s.platform,
      author: s.author,
      handle: s.handle,
      avatar: s.image,
      text: s.text,
      when: s.when,
      destination: s.country,
      href: s.url,
    }));

    return interleave([written, fromVideo, fromGoogle, social]);
  }, [google, videos]);

  /* How many of each source made it in — drives the filter chips' counts,
     and decides which chips exist at all: a source with nothing in it is
     not offered as a filter. */
  const counts = useMemo(
    () =>
      items.reduce<Record<ReviewSource, number>>(
        (acc, item) => {
          acc[item.source] += 1;
          return acc;
        },
        { google: 0, video: 0, written: 0, social: 0 }
      ),
    [items]
  );

  return { items, google, counts };
}
