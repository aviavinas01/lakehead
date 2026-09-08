import { useEffect, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api/client";
import {
  YOUTUBE_FEEDS,
  addYouTubeVideo,
  deleteYouTube,
  fetchAllYouTube,
  importYouTubePlaylist,
  stillFor,
  updateYouTube,
  type YouTubeClip,
  type YouTubeFeed,
} from "../../api/youtubeClips";

/**
 * The two YouTube rows, curated.
 *
 * ADDING NOTHING HERE CHANGES NOTHING. Each row falls back to the playlist
 * in the server's environment whenever it has no published picks, which is
 * how the site behaved before this screen existed. Picks outrank the
 * playlist; deleting the last one hands the row back to it.
 *
 * ONE VIDEO OR A WHOLE PLAYLIST, chosen by a button rather than guessed from
 * the address. A link copied while watching a video that is IN a playlist
 * carries both ids — so "does it contain list=" would import fifteen videos
 * most times somebody meant to add one.
 */

type Mode = "video" | "playlist";

type Status = { kind: "idle" | "busy" | "error" | "done"; message: string };

export default function YouTubeClipsPanel() {
  const [clips, setClips] = useState<YouTubeClip[] | null>(null);
  const [url, setUrl] = useState("");
  const [feed, setFeed] = useState<YouTubeFeed>("stories");
  const [mode, setMode] = useState<Mode>("video");
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  const load = async () => {
    try {
      setClips(await fetchAllYouTube());
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
      setClips([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || status.kind === "busy") return;
    setStatus({ kind: "busy", message: "" });
    try {
      if (mode === "playlist") {
        const { added, skipped } = await importYouTubePlaylist(url.trim(), feed);
        setStatus({
          kind: "done",
          message:
            `Added ${added} video${added === 1 ? "" : "s"}` +
            (skipped ? `, skipped ${skipped} already in this row.` : "."),
        });
      } else {
        await addYouTubeVideo(url.trim(), feed);
        setStatus({ kind: "idle", message: "" });
      }
      setUrl("");
      await load();
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
    }
  };

  const patch = async (id: string, input: Parameters<typeof updateYouTube>[1]) => {
    try {
      await updateYouTube(id, input);
      await load();
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Remove “${title || "this video"}” from the row?`)) return;
    try {
      await deleteYouTube(id);
      await load();
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
    }
  };

  /* Which rows are curated, so the panel can say what each one is doing
     rather than leaving somebody to infer it from an empty list. */
  const live = (f: YouTubeFeed) =>
    (clips ?? []).filter((c) => c.feed === f && c.published).length;

  return (
    <>
      <p className="admin-lead">
        Pick the videos for each row, or import a whole playlist at once. Each
        row appears in one place:{" "}
        {YOUTUBE_FEEDS.map((f, i) => (
          <span key={f.value}>
            {i > 0 ? " · " : ""}
            <strong>{f.label}</strong> → {f.where}
          </span>
        ))}
        .
      </p>
      <p className="admin-lead">
        {/* The fallback is the single most surprising thing about this screen
            if nobody says it out loud. */}
        A row with nothing picked falls back to the YouTube playlist set on
        the server, which is how the site worked before this screen existed —
        so removing the last video here restores the playlist rather than
        emptying the section.
      </p>

      <form className="yta-add" onSubmit={add}>
        <div className="yta-modes" role="group" aria-label="What to add">
          <button
            type="button"
            className={mode === "video" ? "is-on" : undefined}
            aria-pressed={mode === "video"}
            onClick={() => setMode("video")}
          >
            One video
          </button>
          <button
            type="button"
            className={mode === "playlist" ? "is-on" : undefined}
            aria-pressed={mode === "playlist"}
            onClick={() => setMode("playlist")}
          >
            A whole playlist
          </button>
        </div>

        <div className="yta-row">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              mode === "playlist"
                ? "https://www.youtube.com/playlist?list=PL…"
                : "https://www.youtube.com/watch?v=…"
            }
            aria-label={mode === "playlist" ? "Playlist address" : "Video address"}
          />
          <select
            value={feed}
            onChange={(e) => setFeed(e.target.value as YouTubeFeed)}
            aria-label="Which row this belongs in"
          >
            {YOUTUBE_FEEDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <button type="submit" disabled={status.kind === "busy" || !url.trim()}>
            {status.kind === "busy"
              ? "Adding…"
              : mode === "playlist"
              ? "Import"
              : "Add video"}
          </button>
        </div>
      </form>

      {status.kind === "error" ? (
        <p className="form-error" role="status">{status.message}</p>
      ) : status.kind === "done" ? (
        <p className="yta-done" role="status">{status.message}</p>
      ) : null}

      <p className="yta-state">
        {YOUTUBE_FEEDS.map((f) => (
          <span key={f.value}>
            <strong>{f.label}:</strong>{" "}
            {clips === null
              ? "…"
              : live(f.value) > 0
              ? `${live(f.value)} picked`
              : "using the server playlist"}
          </span>
        ))}
      </p>

      {clips === null ? (
        <p className="admin-lead">Loading…</p>
      ) : clips.length === 0 ? (
        <p className="admin-lead">
          Nothing picked yet. Both rows are reading the playlists configured
          on the server.
        </p>
      ) : (
        <ul className="tta-list">
          {clips.map((c) => (
            <li className="tta-item" key={c._id} data-off={!c.published || undefined}>
              <span className="tta-thumb">
                <img src={stillFor(c.videoId)} alt="" loading="lazy" />
              </span>

              <span className="tta-body">
                {/* Editable, because YouTube titles are written for YouTube
                    search. Saved on blur — one field, so no save button. */}
                <input
                  className="tta-title"
                  defaultValue={c.title}
                  aria-label="Title shown on the site"
                  onBlur={(e) => {
                    if (e.target.value !== c.title) {
                      void patch(c._id, { title: e.target.value });
                    }
                  }}
                />
                <span className="tta-meta">
                  <select
                    value={c.feed}
                    aria-label="Move this video to the other row"
                    onChange={(e) =>
                      void patch(c._id, { feed: e.target.value as YouTubeFeed })
                    }
                  >
                    {YOUTUBE_FEEDS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <a
                    className="tta-url"
                    href={c.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {c.authorName || c.videoId}
                  </a>
                </span>
              </span>

              <span className="tta-actions">
                <button
                  type="button"
                  onClick={() => void patch(c._id, { published: !c.published })}
                >
                  {c.published ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  className="tta-del"
                  onClick={() => void remove(c._id, c.title)}
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
