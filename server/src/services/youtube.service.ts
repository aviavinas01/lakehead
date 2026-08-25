import { env } from "../config/env.js";

/**
 * The videos shown in the "Your Success Story Starts Here" row.
 *
 * They come from YouTube's public RSS feed — the same feed a podcast app
 * would read. That choice is deliberate: it needs no API key, no Google
 * Cloud project and has no quota, where the YouTube Data API needs all
 * three. The trade is that a feed carries only the 15 most recent items,
 * which is more than the row shows anyway.
 *
 * Point it at a PLAYLIST rather than the channel if you can (see env.ts):
 * a playlist is curated, so only the videos you add to it appear here,
 * and adding one publishes it to the site with no deploy and no upload.
 *
 * The result is cached in memory for CACHE_MS. A busy site therefore asks
 * YouTube a couple of times an hour at most, and a blip at their end is
 * covered by the last good answer rather than emptying the row.
 */

export interface YouTubeVideo {
  /** The 11-character video id — all the embed needs */
  id: string;
  title: string;
  /** Channel name, shown when a video has no better caption */
  author: string;
  publishedAt: string;
  thumbnail: string;
}

const CACHE_MS = 30 * 60 * 1000;

/* A lookup that did NOT come back with videos is retried within the minute
   rather than being locked in for half an hour.
 *
 * This is the bug that used to put the placeholder videos back after every
 * deploy. The cache lives in memory, so a new container starts empty; if
 * that very first fetch hiccupped — a cold DNS lookup, a slow start, any
 * blip — the empty result was cached for the full CACHE_MS, and every
 * visitor for the next thirty minutes got an empty list and fell through to
 * the fallback. Nothing was wrong with the playlist; the server had simply
 * cached one bad moment. */
const RETRY_MS = 60 * 1000;

/* YouTube does not get to hold a request open indefinitely. */
const TIMEOUT_MS = 8000;

/** The named feeds this service can serve. Each is cached independently. */
export const FEEDS = ["stories", "testimonials"] as const;
export type Feed = (typeof FEEDS)[number];

/** `live` marks a list that actually came back with videos in it. */
interface Entry {
  value: YouTubeVideo[];
  at: number;
  live: boolean;
}
const caches = new Map<Feed, Entry>();

const byPlaylist = (id: string) =>
  `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(id)}`;

/**
 * Where each feed reads from. "stories" prefers its playlist and falls back
 * to the channel's uploads; "testimonials" is playlist-only, because an
 * unset testimonials playlist should render nothing rather than quietly
 * showing the same videos as the row above it.
 */
function feedUrl(feed: Feed): string | null {
  const {
    YOUTUBE_PLAYLIST_ID: playlist,
    YOUTUBE_CHANNEL_ID: channel,
    YOUTUBE_TESTIMONIALS_PLAYLIST_ID: testimonials,
  } = env;

  if (feed === "testimonials") {
    return testimonials ? byPlaylist(testimonials) : null;
  }
  if (playlist) return byPlaylist(playlist);
  if (channel) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel)}`;
  }
  return null;
}

/* Feed text is XML-escaped — titles routinely carry & and quotes. */
function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&");
}

function tag(entry: string, name: string): string {
  const match = entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  const value = match?.[1];
  return value ? decodeXml(value.trim()) : "";
}

/**
 * Pulls the handful of fields the row needs out of the feed. Reading it with
 * a few expressions rather than an XML parser keeps a dependency off the
 * server for a document whose shape YouTube has kept stable for years; any
 * entry that does not yield a video id is skipped rather than trusted.
 */
function parseFeed(xml: string): YouTubeVideo[] {
  const entries = xml.split("<entry>").slice(1);

  return entries.flatMap((entry) => {
    const id = tag(entry, "yt:videoId");
    if (!/^[\w-]{11}$/.test(id)) return [];

    const thumbnail =
      entry.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] ??
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    return [
      {
        id,
        title: tag(entry, "title") || tag(entry, "media:title"),
        author: tag(entry, "name"),
        publishedAt: tag(entry, "published"),
        thumbnail: decodeXml(thumbnail),
      },
    ];
  });
}

async function fetchFromYouTube(feed: Feed): Promise<YouTubeVideo[]> {
  const url = feedUrl(feed);
  if (!url) return [];

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`YouTube feed responded ${res.status}: ${await res.text()}`);
  }
  return parseFeed(await res.text());
}

export const youtubeService = {
  async list(feed: Feed = "stories"): Promise<YouTubeVideo[]> {
    const cache = caches.get(feed);
    /* A good list is trusted for CACHE_MS; anything else is re-checked
       within RETRY_MS, so a bad moment costs a minute rather than an hour. */
    const ttl = cache?.live ? CACHE_MS : RETRY_MS;
    if (cache && Date.now() - cache.at < ttl) return cache.value;

    try {
      const value = await fetchFromYouTube(feed);
      if (value.length > 0) {
        caches.set(feed, { value, at: Date.now(), live: true });
        return value;
      }
      /* Parsed cleanly but yielded nothing: an unset id, an empty playlist,
         or a feed whose shape has moved. Not something to publish. */
      if (feedUrl(feed)) {
        console.warn(`YouTube feed "${feed}" returned no usable videos`);
      }
    } catch (err) {
      console.error(`YouTube feed "${feed}" lookup failed:`, err);
    }

    /* Once a good list has been seen it keeps being served for as long as it
       takes to get another one — the row is never emptied by a blip, only
       ever replaced by a newer list. */
    const value = cache?.value ?? [];
    caches.set(feed, { value, at: Date.now(), live: false });
    return value;
  },

  /** Fetches once at boot so the first visitor after a deploy never pays for
      the first lookup, and a fresh container is already warm before anyone
      loads the page. Failure here is not fatal: list() will retry. */
  warm(): void {
    for (const feed of FEEDS) void this.list(feed);
  },
};
