import { useEffect, useState } from "react";
import api from "../api/client";
import type { YouTubeVideo } from "../types/api";

/**
 * Reads one of the server's named YouTube feeds.
 *
 * There is deliberately no fallback content anywhere this is used. Empty
 * means empty, and the caller renders nothing — placeholder clips used to
 * sit behind the success-stories row, and every redeploy that caught the
 * feed at a bad moment put them back on the live site. A row that is
 * briefly absent beats a row confidently showing the wrong thing.
 *
 * The retries below cover the seconds around a deploy, when the API is
 * reachable but not yet answering; the server covers everything longer than
 * that by serving its last good list until it has a newer one
 * (server/src/services/youtube.service.ts).
 */

/** Widening gaps, in ms. */
const RETRY_DELAYS = [1200, 3500, 9000];

export type FeedName = "stories" | "testimonials";

export function useYouTubeFeed(feed: FeedName = "stories"): YouTubeVideo[] {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const load = async (attempt = 0) => {
      try {
        const { data } = await api.get<{ videos: YouTubeVideo[] }>(
          "/youtube/videos",
          { params: { feed }, quiet: true }
        );
        if (cancelled) return;
        if (data.videos.length > 0) {
          setVideos(data.videos);
          return;
        }
      } catch {
        /* falls through to the retry below */
      }
      if (cancelled || attempt >= RETRY_DELAYS.length) return;
      timer = window.setTimeout(() => void load(attempt + 1), RETRY_DELAYS[attempt]);
    };

    void load();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [feed]);

  return videos;
}
