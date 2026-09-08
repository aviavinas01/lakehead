import { asyncHandler } from "../utils/asyncHandler.js";
import { youtubeService, FEEDS, type Feed } from "../services/youtube.service.js";
import {
  youtubeClipService,
  isFeed,
  playlistIdFrom,
  thumbnailFor,
  videoIdFrom,
} from "../services/youtubeClip.service.js";

export const listVideos = asyncHandler(async (req, res) => {
  /* ?feed=testimonials selects the second row; anything unrecognised falls
     back to the main one rather than erroring. */
  const requested = String(req.query.feed ?? "stories");
  const feed = (FEEDS as readonly string[]).includes(requested)
    ? (requested as Feed)
    : "stories";

  /* ------------------------------------------------------------------
     CURATED FIRST, PLAYLIST SECOND — the whole integration, in one branch.

     If somebody has picked videos for this row in the admin, the row is
     exactly those, in the order they set. If nobody has, it is the RSS feed
     behaving exactly as it always did.

     Both directions matter. Adding no picks changes nothing, so this could
     not break the rows it was added to; and deleting the last pick restores
     the playlist rather than leaving an empty section, so a row cannot be
     emptied by mistake.
     ------------------------------------------------------------------ */
  const picked = await youtubeClipService.listPublished(feed);
  if (picked.length > 0) {
    res.json({
      videos: picked.map((c) => ({
        id: c.videoId,
        title: c.title,
        author: c.authorName,
        /* The row's shape is the RSS one, so the client cannot tell which
           source answered — and does not have to. `publishedAt` is when we
           added it, which is the only date a curated list has. */
        publishedAt: c.createdAt.toISOString(),
        thumbnail: thumbnailFor(c.videoId),
      })),
    });
    return;
  }

  res.json({ videos: await youtubeService.list(feed) });
});

/**
 * GET /youtube/status — why the row is or is not showing anything.
 *
 * Deliberately public and deliberately dull: it reports whether a source is
 * configured, how many videos are cached, which source they came from, how
 * long ago it checked, and the last upstream error. It never returns the
 * playlist or channel id itself, so it gives away nothing that the videos on
 * the page do not already.
 */
export const status = asyncHandler(async (_req, res) => {
  res.json({ feeds: youtubeService.status() });
});

/* ---- the admin side ---- */

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ clips: await youtubeClipService.listAll() });
});

/**
 * POST /youtube — one video, or a whole playlist.
 *
 * ------------------------------------------------------------------
 * THE CALLER SAYS WHICH, because the address alone cannot.
 *
 * Copying the URL while watching a video that happens to be IN a playlist
 * gives you `watch?v=...&list=...` — it carries both ids, and it is what the
 * browser bar hands you most of the time. Deciding by looking for `list=`
 * therefore imports fifteen videos every time somebody meant to add one,
 * which is a tedious thing to undo and an easy thing to do by accident.
 *
 * So `mode` is explicit, and the admin screen has two buttons rather than
 * asking anyone to classify their own link. When it is absent — a caller
 * that predates this, or a script — the inference is the SAFE direction: a
 * single video whenever the address names one at all, and a playlist only
 * when it names no video. Guessing small is recoverable; guessing big is a
 * fifteen-row cleanup.
 * ------------------------------------------------------------------
 */
export const create = asyncHandler(async (req, res) => {
  const { url, feed: raw, mode } = req.body as {
    url: string;
    feed?: unknown;
    mode?: "video" | "playlist";
  };
  const feed: Feed = isFeed(raw) ? raw : "stories";

  const asPlaylist =
    mode === "playlist" ||
    (mode === undefined && videoIdFrom(url) === null && playlistIdFrom(url) !== null);

  if (asPlaylist) {
    res.status(201).json(await youtubeClipService.addPlaylist(url, feed));
    return;
  }

  res.status(201).json({ clip: await youtubeClipService.addVideo(url, feed) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({
    clip: await youtubeClipService.update(req.params.id as string, req.body),
  });
});

export const remove = asyncHandler(async (req, res) => {
  await youtubeClipService.remove(req.params.id as string);
  res.json({ message: "Video removed" });
});
