import {
  TikTok,
  TIKTOK_CATEGORIES,
  type ITikTok,
  type TikTokCategory,
} from "../models/TikTok.js";

/**
 * The TikTok clips shown on the home page.
 *
 * Everything about a clip except its URL comes from TikTok's oEmbed
 * endpoint, which is public, needs no key and no registered application —
 * the same reason the YouTube row reads an RSS feed rather than the Data
 * API. What it does NOT give us is a way to list an account's videos, so
 * the list itself is curated from the admin. See the note on the model.
 *
 * ------------------------------------------------------------------
 * THE THUMBNAILS EXPIRE. THAT IS THE WHOLE DESIGN PROBLEM HERE.
 *
 * oEmbed hands back an image URL on a signed CDN, and the signature has a
 * life measured in hours or days rather than months. Store it once and the
 * row silently goes blank later, with nothing in the code having changed and
 * nothing in the logs to say why.
 *
 * So a read refreshes anything stale: any clip whose `fetchedAt` is older
 * than REFRESH_MS is re-asked in the background and written back. That is
 * done on READ rather than on a timer because there is no scheduler in this
 * app, and a page nobody visits does not need fresh thumbnails.
 *
 * A refresh that fails changes nothing. The old row is served exactly as it
 * was — a stale thumbnail that may still work beats an empty one that
 * certainly does not, and the next reader tries again.
 * ------------------------------------------------------------------
 */

/** How long a cached oEmbed answer is trusted before it is re-asked. */
const REFRESH_MS = 6 * 60 * 60 * 1000;

/** Give up on TikTok rather than hold a request open. */
const TIMEOUT_MS = 6000;

export interface TikTokClip {
  id: string;
  videoId: string;
  url: string;
  title: string;
  authorName: string;
  thumbnail: string;
  category: TikTokCategory;
}

/**
 * The numeric id out of any of the shapes a TikTok link comes in.
 *
 *   https://www.tiktok.com/@handle/video/7301234567890123456
 *   https://www.tiktok.com/@handle/video/730…?is_from_webapp=1&…
 *   https://m.tiktok.com/v/7301234567890123456.html
 *
 * Short links (vm.tiktok.com/XXXX) are NOT handled and cannot be: they are
 * redirects, and resolving one means a network round trip, which does not
 * belong in a synchronous parse. The admin form says so rather than failing
 * with something vague.
 */
export function parseVideoId(url: string): string | null {
  const patterns = [
    /\/video\/(\d{6,})/,
    /\/v\/(\d{6,})/,
    /^(\d{6,})$/,
  ];
  for (const re of patterns) {
    const m = url.trim().match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

interface OEmbed {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
}

/** Ask TikTok about one video. Resolves to null on any failure at all. */
async function lookup(url: string): Promise<OEmbed | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    return (await res.json()) as OEmbed;
  } catch {
    /* Timeout, DNS, TikTok being TikTok. The caller keeps what it had. */
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const shape = (doc: ITikTok & { _id: unknown }): TikTokClip => ({
  id: String(doc._id),
  videoId: doc.videoId,
  url: doc.url,
  title: doc.title,
  authorName: doc.authorName,
  thumbnail: doc.thumbnail,
  category: doc.category,
});

/**
 * Re-ask oEmbed for anything stale and write the answer back.
 *
 * Fire-and-forget: the caller does not await this, so a slow TikTok cannot
 * make the home page slow. The refreshed values reach the next reader.
 */
function refreshStale(docs: TikTokDoc[]): void {
  const cutoff = Date.now() - REFRESH_MS;
  const stale = docs.filter((d) => !d.fetchedAt || d.fetchedAt.getTime() < cutoff);
  if (stale.length === 0) return;

  void Promise.all(
    stale.map(async (doc) => {
      const data = await lookup(doc.url);
      if (!data?.thumbnail_url) return;
      await TikTok.updateOne(
        { _id: doc._id },
        {
          thumbnail: data.thumbnail_url,
          /* The title is only taken if nobody has written one here. A clip
             retitled for the site keeps that title through every refresh. */
          ...(doc.title ? {} : { title: data.title ?? "" }),
          authorName: data.author_name ?? doc.authorName,
          fetchedAt: new Date(),
        }
      ).catch(() => undefined);
    })
  ).catch(() => undefined);
}

type TikTokDoc = ITikTok & { _id: unknown };

export const tiktokService = {
  parseVideoId,

  /**
   * The published clips for one shelf, newest-ranked first.
   *
   * A category is REQUIRED rather than optional-with-everything-as-default.
   * Each shelf lives on exactly one page, and a call that forgot to say which
   * would quietly put visa clips under the student testimonials.
   */
  async listPublished(category: TikTokCategory): Promise<TikTokClip[]> {
    const docs = (await TikTok.find({ published: true, category })
      .sort({ order: 1, createdAt: -1 })
      .lean()) as unknown as TikTokDoc[];
    refreshStale(docs);
    return docs.map(shape);
  },

  /** Everything, published or not, for the admin screen. */
  isCategory(v: unknown): v is TikTokCategory {
    return TIKTOK_CATEGORIES.includes(v as TikTokCategory);
  },

  async listAll(): Promise<(TikTokClip & { published: boolean; order: number })[]> {
    const docs = (await TikTok.find()
      .sort({ order: 1, createdAt: -1 })
      .lean()) as unknown as (TikTokDoc & { published: boolean; order: number })[];
    return docs.map((d) => ({ ...shape(d), published: d.published, order: d.order }));
  },

  /**
   * Add a clip from a pasted URL.
   *
   * The oEmbed lookup happens HERE, once, while somebody is watching a form
   * — which is the right moment for it. If TikTok is unreachable the clip is
   * still saved with what we know, and the first refresh fills in the rest;
   * a video that is genuinely private or deleted is caught by the caller,
   * which checks that a title came back.
   */
  async create(url: string, category: TikTokCategory = "testimonial") {
    const videoId = parseVideoId(url);
    if (!videoId) {
      const err = new Error(
        "That does not look like a TikTok video link. Open the video on tiktok.com and copy the address from the bar — a vm.tiktok.com short link will not work."
      ) as Error & { statusCode?: number };
      err.statusCode = 400;
      throw err;
    }

    const existing = await TikTok.findOne({ videoId });
    if (existing) {
      const err = new Error("That clip is already in the row.") as Error & {
        statusCode?: number;
      };
      err.statusCode = 409;
      throw err;
    }

    const data = await lookup(url);
    const doc = await TikTok.create({
      url: url.trim(),
      videoId,
      title: data?.title ?? "",
      authorName: data?.author_name ?? "",
      thumbnail: data?.thumbnail_url ?? "",
      fetchedAt: data ? new Date() : undefined,
      category,
      published: true,
    });
    return shape(doc as unknown as TikTokDoc);
  },

  async update(
    id: string,
    patch: Partial<Pick<ITikTok, "title" | "published" | "order" | "category">>
  ) {
    const doc = await TikTok.findByIdAndUpdate(id, patch, { new: true }).lean();
    if (!doc) {
      const err = new Error("Clip not found") as Error & { statusCode?: number };
      err.statusCode = 404;
      throw err;
    }
    return shape(doc as unknown as TikTokDoc);
  },

  async remove(id: string) {
    await TikTok.findByIdAndDelete(id);
  },
};
