import { env } from "../config/env.js";

/**
 * The videos shown in the "Your Success Story Starts Here" row, and in the
 * testimonial row on the Study Abroad page.
 *
 * They come from YouTube's public RSS feed — the same feed a podcast app
 * would read. That choice is deliberate: it needs no API key, no Google
 * Cloud project and has no quota, where the YouTube Data API needs all
 * three. The trade is that a feed carries only the 15 most recent items,
 * which is more than either row shows.
 *
 * ------------------------------------------------------------------
 * WHY THIS FILE WAS REWRITTEN — the row went empty in production.
 *
 * The cause is upstream and is still happening: YouTube's PLAYLIST feed
 * (`videos.xml?playlist_id=…`) is unreliable. Hitting one valid, public,
 * known-good playlist twelve times in a row returns 200 eight times and
 * 404 or 500 the other four. The CHANNEL feed (`?channel_id=…`) answered
 * every single time. So roughly a third of playlist lookups fail for no
 * reason and recover on their own moments later.
 *
 * The old code was built for a source that fails occasionally, not one that
 * fails a third of the time, and three things combined to turn a transient
 * upstream blip into a permanently empty row:
 *
 *   1. ONE ATTEMPT PER LOOKUP. A single 404 was the whole answer.
 *
 *   2. A FAILED LOOKUP WAS CACHED FOR 60 SECONDS, and the client's retry
 *      budget is 1.2s + 3.5s + 9s ≈ 14s. Every one of those retries landed
 *      inside the same 60-second window and was served the identical cached
 *      empty array. The retry logic could not possibly recover — it was
 *      re-asking a cache, not YouTube.
 *
 *   3. NOTHING RETRIED ON ITS OWN. Recovery needed a visitor to arrive
 *      after the window expired. If the fetch at boot lost the coin toss,
 *      the row was empty for everyone until someone happened to load the
 *      page a minute later — and if that lookup also failed, again.
 *
 * All three are addressed below: several attempts per lookup, a cold cache
 * that is re-checked in seconds rather than minutes, and a background
 * refresh so the list heals whether or not anyone is looking. The playlist
 * also now falls back to the channel feed when it is the one failing.
 * ------------------------------------------------------------------
 *
 * Point it at a PLAYLIST rather than the channel if you can (see env.ts):
 * a playlist is curated, so only the videos you add to it appear, and
 * adding one publishes it to the site with no deploy and no upload.
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

/** How long a list that actually came back is trusted. */
const CACHE_MS = 30 * 60 * 1000;

/** A cache that HAS held videos re-checks this often once it goes stale. */
const RETRY_MS = 60 * 1000;

/**
 * A cache that has NEVER held videos re-checks this often.
 *
 * Deliberately shorter than the client's ~14s retry budget, so a visitor's
 * second or third attempt reaches YouTube again instead of being handed the
 * same cached failure. This number and the client's RETRY_DELAYS in
 * client/src/hooks/useYouTubeFeed.ts are a pair: if either moves, check that
 * at least one client retry still falls outside this window.
 */
const COLD_RETRY_MS = 4 * 1000;

/** Attempts per source inside a single lookup, before moving to the next. */
const ATTEMPTS = 3;

/** Pause between those attempts. Short — the failures are instant 404s. */
const BACKOFF_MS = 350;

/** YouTube does not get to hold a request open indefinitely. */
const TIMEOUT_MS = 8000;

/** How often the server refreshes on its own, with nobody watching. */
const REFRESH_MS = 5 * 60 * 1000;

/** The named feeds this service can serve. Each is cached independently. */
export const FEEDS = ["stories", "testimonials"] as const;
export type Feed = (typeof FEEDS)[number];

interface Entry {
  value: YouTubeVideo[];
  at: number;
  /** True once this feed has held real videos. Governs which TTL applies. */
  live: boolean;
  /** Kept for the status endpoint, so a bad id is diagnosable from outside. */
  lastError?: string;
  /** Which source the current list came from. */
  source?: string;
}

const caches = new Map<Feed, Entry>();

/**
 * The lookup currently in flight per feed.
 *
 * Without this, ten visitors arriving at once on a cold cache would each
 * start their own lookup — ten times the requests to an upstream that is
 * already rate-limiting us, and ten chances to write a different answer into
 * the same cache slot. They now all await the same promise.
 */
const inFlight = new Map<Feed, Promise<YouTubeVideo[]>>();

/**
 * Accepts what people actually paste.
 *
 * A playlist id is the `list=` parameter, but the thing to hand is the whole
 * URL from the address bar, and a pasted URL fails silently forever — the
 * feed 404s and nothing says why. Pulling the id out of a URL costs three
 * lines and removes an entire category of "it just doesn't work".
 */
function cleanId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  const fromUrl = value.match(/[?&](?:list|channel_id)=([^&\s]+)/);
  return (fromUrl?.[1] ?? value.replace(/^@/, "")) || undefined;
}

const byPlaylist = (id: string) =>
  `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(id)}`;

const byChannel = (id: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(id)}`;

/**
 * Where a feed reads from, in the order it should be tried.
 *
 * "stories" now lists the channel as a SECOND source rather than only as a
 * substitute for an unset playlist. The playlist is still preferred and
 * still wins whenever it answers; the channel is there for the third of the
 * time it does not. An uncurated row of recent uploads is a worse row than a
 * curated one — and a considerably better one than no row at all.
 *
 * "testimonials" stays playlist-only. Falling back to the channel there
 * would quietly fill the Study Abroad testimonial row with whatever was
 * uploaded last, which is not a testimonial and would look like a bug.
 */
function sourcesFor(feed: Feed): { label: string; url: string }[] {
  const playlist = cleanId(env.YOUTUBE_PLAYLIST_ID);
  const channel = cleanId(env.YOUTUBE_CHANNEL_ID);
  const testimonials = cleanId(env.YOUTUBE_TESTIMONIALS_PLAYLIST_ID);

  if (feed === "testimonials") {
    return testimonials ? [{ label: "testimonials playlist", url: byPlaylist(testimonials) }] : [];
  }

  const out: { label: string; url: string }[] = [];
  if (playlist) out.push({ label: "playlist", url: byPlaylist(playlist) });
  if (channel) out.push({ label: "channel", url: byChannel(channel) });
  return out;
}

/** Feed text is XML-escaped — titles routinely carry & and quotes. */
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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(url: string): Promise<YouTubeVideo[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`responded ${res.status}`);
  return parseFeed(await res.text());
}

/**
 * Tries every source in turn, several times each, and returns the first
 * non-empty list.
 *
 * The repeat is the single most important change in this file. At YouTube's
 * observed ~1-in-3 playlist failure rate, one attempt fails a third of the
 * time; three independent attempts fail about one time in thirty — and with
 * the channel feed behind it as a second source, effectively never.
 */
async function lookup(feed: Feed): Promise<{ videos: YouTubeVideo[]; source?: string; error?: string }> {
  const sources = sourcesFor(feed);
  if (sources.length === 0) return { videos: [], error: "no playlist or channel id configured" };

  const problems: string[] = [];

  for (const source of sources) {
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      try {
        const videos = await fetchOnce(source.url);
        if (videos.length > 0) return { videos, source: source.label };
        /* Parsed cleanly but empty: an empty playlist, or a feed whose shape
           has moved. Retrying an empty-but-valid document is pointless, so
           move straight on to the next source. */
        problems.push(`${source.label}: no videos in feed`);
        break;
      } catch (err) {
        problems.push(`${source.label} attempt ${attempt}: ${(err as Error).message}`);
        if (attempt < ATTEMPTS) await wait(BACKOFF_MS * attempt);
      }
    }
  }

  return { videos: [], error: problems.join("; ") };
}

async function refresh(feed: Feed): Promise<YouTubeVideo[]> {
  const cache = caches.get(feed);
  const { videos, source, error } = await lookup(feed);

  if (videos.length > 0) {
    caches.set(feed, { value: videos, at: Date.now(), live: true, source });
    return videos;
  }

  if (error) console.warn(`YouTube feed "${feed}" came back empty — ${error}`);

  /* Once a good list has been seen it keeps being served for as long as it
     takes to get another one. The row is never emptied by a blip, only ever
     replaced by a newer list. `live` is carried over rather than cleared:
     it records that this feed HAS worked, which is what decides whether the
     value being served is real content or a placeholder for nothing. */
  const value = cache?.value ?? [];
  caches.set(feed, {
    value,
    at: Date.now(),
    live: Boolean(cache?.live && value.length > 0),
    lastError: error,
    source: cache?.source,
  });
  return value;
}

export const youtubeService = {
  async list(feed: Feed = "stories"): Promise<YouTubeVideo[]> {
    const cache = caches.get(feed);

    /* Three tiers: a live list is trusted for half an hour; a list that has
       gone stale is re-checked every minute; a feed that has never produced
       anything is re-checked within seconds, so a visitor's retry actually
       reaches YouTube rather than the cache. */
    const ttl = cache?.live ? CACHE_MS : cache?.value.length ? RETRY_MS : COLD_RETRY_MS;
    if (cache && Date.now() - cache.at < ttl) return cache.value;

    /* Concurrent callers share one lookup. */
    const running = inFlight.get(feed);
    if (running) return running;

    const promise = refresh(feed).finally(() => inFlight.delete(feed));
    inFlight.set(feed, promise);
    return promise;
  },

  /**
   * What the server currently believes, for GET /youtube/status.
   *
   * This exists because the failure it was written for was invisible from
   * outside: the row simply was not there, and the only way to tell an
   * unset environment variable from a mistyped playlist id from YouTube
   * having a bad afternoon was to read the container's logs. Now it answers
   * that in one request.
   */
  status() {
    return FEEDS.map((feed) => {
      const cache = caches.get(feed);
      return {
        feed,
        configured: sourcesFor(feed).length > 0,
        sources: sourcesFor(feed).map((s) => s.label),
        videos: cache?.value.length ?? 0,
        live: cache?.live ?? false,
        servingFrom: cache?.source,
        checkedSecondsAgo: cache ? Math.round((Date.now() - cache.at) / 1000) : null,
        lastError: cache?.lastError,
      };
    });
  },

  /**
   * Fetches at boot so the first visitor after a deploy never pays for the
   * first lookup, then keeps refreshing on a timer.
   *
   * The timer is the part that was missing. Before, recovery from a failed
   * lookup required a visitor to arrive after the retry window had passed —
   * so a deploy that lost the coin toss left the row empty until someone
   * happened to load the page, and their own retries were all served the
   * same cached failure. Now the server heals itself whether or not anyone
   * is watching.
   *
   * unref() so this timer never holds the process open on its own; a server
   * shutting down should not wait five minutes for a refresh it does not
   * need.
   */
  warm(): void {
    for (const feed of FEEDS) void this.list(feed);
    setInterval(() => {
      for (const feed of FEEDS) void refresh(feed);
    }, REFRESH_MS).unref();
  },
};
