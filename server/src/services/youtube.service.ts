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

let cache: { value: YouTubeVideo[]; at: number } | null = null;

/** Where to read from: a playlist if one is configured, else the channel. */
function feedUrl(): string | null {
  const { YOUTUBE_PLAYLIST_ID: playlist, YOUTUBE_CHANNEL_ID: channel } = env;
  if (playlist) {
    return `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlist)}`;
  }
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

async function fetchFromYouTube(): Promise<YouTubeVideo[]> {
  const url = feedUrl();
  if (!url) return [];

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube feed responded ${res.status}: ${await res.text()}`);
  }
  return parseFeed(await res.text());
}

export const youtubeService = {
  async list(): Promise<YouTubeVideo[]> {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

    try {
      const value = await fetchFromYouTube();
      cache = { value, at: Date.now() };
      return value;
    } catch (err) {
      console.error("YouTube feed lookup failed:", err);
      /* Serve the last good list if there is one — a blip at YouTube's end
         should not empty the row on the site. */
      const value = cache?.value ?? [];
      cache = { value, at: Date.now() };
      return value;
    }
  },
};
