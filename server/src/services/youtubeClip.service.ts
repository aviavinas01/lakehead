import { YouTubeClip, type YouTubeClipDocument } from "../models/YouTubeClip.js";
import { youtubeService, cleanId, FEEDS, type Feed } from "./youtube.service.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * The curated YouTube rows: adding by single video or by whole playlist.
 *
 * NO API KEY, ANYWHERE. Titles come from YouTube's oEmbed endpoint and
 * playlists from the public RSS feed — both open, both unmetered. The
 * YouTube Data API would want a Google Cloud project, a key to keep secret
 * and a daily quota, for two rows of videos.
 */

const ORDER = { order: 1, createdAt: -1 } as const;

/** How long to wait on oEmbed before giving up on the title. */
const TIMEOUT_MS = 8000;

export const isFeed = (value: unknown): value is Feed =>
  typeof value === "string" && (FEEDS as readonly string[]).includes(value);

/**
 * The 11-character id out of anything somebody might paste.
 *
 * Five shapes in the wild and all of them get pasted: the watch URL, the
 * youtu.be short link, /shorts/, /embed/, and occasionally the bare id. A
 * function that only understood the first would reject four reasonable
 * inputs with "that is not a YouTube link", which is both wrong and rude.
 */
export function videoIdFrom(raw: string): string | null {
  const value = raw.trim();
  if (/^[\w-]{11}$/.test(value)) return value;

  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    /* `?? null` because an indexed match is typed as possibly undefined under
       noUncheckedIndexedAccess — a matched group always exists here, but the
       compiler is right that nothing in the type says so. */
    const found = value.match(re);
    if (found) return found[1] ?? null;
  }
  return null;
}

/** A playlist id, if the URL carries one. */
export const playlistIdFrom = (raw: string): string | null => {
  const id = cleanId(raw);
  /* `cleanId` hands back the input untouched when there is no `list=` in it,
     which for a plain watch URL would be the whole URL. A real playlist id
     is a long run of URL-safe characters with no slashes in it, so the shape
     test is what separates "there was a list= here" from "this is a link". */
  if (!id) return null;
  return /^[A-Za-z0-9_-]{12,}$/.test(id) ? id : null;
};

/**
 * The still, from the id alone.
 *
 * NOT `maxresdefault`. That one only exists for videos uploaded above a
 * certain resolution and 404s for everything else — which is exactly the
 * broken-image noise that was showing up in the browser console. `hqdefault`
 * is generated for every video ever uploaded.
 */
export const thumbnailFor = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

const watchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

/**
 * Title and channel from oEmbed. Open, keyless, and allowed to fail.
 *
 * A lookup that does not answer must not stop the video being added: the id
 * is the only thing the embed needs, and a missing title is a field the
 * admin can type. Failing the whole request over a caption would be the
 * lookup deciding what the office is allowed to publish.
 */
async function describe(videoId: string): Promise<{ title: string; authorName: string }> {
  try {
    const url =
      "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent(watchUrl(videoId));
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return { title: "", authorName: "" };
    const data = (await res.json()) as { title?: string; author_name?: string };
    return { title: data.title ?? "", authorName: data.author_name ?? "" };
  } catch {
    return { title: "", authorName: "" };
  }
}

export const youtubeClipService = {
  /** The row, when it has been curated. Empty means "use the RSS feed". */
  async listPublished(feed: Feed): Promise<YouTubeClipDocument[]> {
    return YouTubeClip.find({ feed, published: true }).sort(ORDER);
  },

  async listAll(): Promise<YouTubeClipDocument[]> {
    return YouTubeClip.find().sort(ORDER);
  },

  /** One video. */
  async addVideo(url: string, feed: Feed): Promise<YouTubeClipDocument> {
    const videoId = videoIdFrom(url);
    if (!videoId) {
      throw ApiError.badRequest(
        "That does not look like a YouTube video link. Copy the address from the browser bar."
      );
    }

    const existing = await YouTubeClip.findOne({ feed, videoId });
    if (existing) throw ApiError.conflict("That video is already in this row.");

    const { title, authorName } = await describe(videoId);
    return YouTubeClip.create({
      url: watchUrl(videoId),
      videoId,
      title,
      authorName,
      feed,
    });
  },

  /**
   * Every video in a playlist, skipping the ones already in this row.
   *
   * `insertMany` with `ordered: false` rather than a loop: one round trip,
   * and a duplicate that slips past the pre-filter is rejected by the unique
   * index without taking the rest of the batch down with it.
   */
  async addPlaylist(url: string, feed: Feed): Promise<{ added: number; skipped: number }> {
    const playlistId = playlistIdFrom(url);
    if (!playlistId) {
      throw ApiError.badRequest(
        "No playlist id in that address. A playlist link contains `list=`."
      );
    }

    /* YouTube's playlist feed is documented in youtube.service as failing
       roughly a third of the time, and has been observed answering 404 for
       every playlist at once. That is not a 500 on our side and must not be
       reported as one: a stack trace saying "Internal server error" sends
       somebody looking for a bug in this repository when the right response
       is to try again in a minute. */
    let videos;
    try {
      videos = await youtubeService.playlist(playlistId);
    } catch (err) {
      throw ApiError.badGateway(
        `YouTube did not return that playlist (${(err as Error).message}). ` +
          "Their playlist feed fails intermittently — try again in a moment. " +
          "If it keeps failing, check the playlist is Public rather than Unlisted."
      );
    }

    if (videos.length === 0) {
      throw ApiError.badRequest("That playlist came back empty. Is it public?");
    }

    const have = new Set(
      (await YouTubeClip.find({ feed }).select("videoId")).map((c) => c.videoId)
    );
    const fresh = videos.filter((v) => !have.has(v.id));

    if (fresh.length > 0) {
      await YouTubeClip.insertMany(
        fresh.map((v, i) => ({
          url: watchUrl(v.id),
          videoId: v.id,
          title: v.title,
          authorName: v.author,
          feed,
          /* Kept in the playlist's own order, after anything already here. */
          order: have.size + i,
        })),
        { ordered: false }
      );
    }

    return { added: fresh.length, skipped: videos.length - fresh.length };
  },

  async update(
    id: string,
    input: { title?: string; feed?: Feed; published?: boolean; order?: number }
  ): Promise<YouTubeClipDocument> {
    const clip = await YouTubeClip.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!clip) throw ApiError.notFound("Video not found");
    return clip;
  },

  async remove(id: string): Promise<void> {
    const clip = await YouTubeClip.findByIdAndDelete(id);
    if (!clip) throw ApiError.notFound("Video not found");
  },
};
