import { useState } from "react";
import { HELP_VIDEO_ID, HELP_VIDEO_TITLE } from "../../config/video";

/**
 * The one video that sits under the red "talk to us" band, on every page
 * that carries one.
 *
 * No heading, no copy, no button — a single wide rectangle and nothing else.
 * The band above it has already made the ask; a second heading here would be
 * the page asking twice, and the whole point of a full-width still is that
 * it does not need introducing.
 *
 * SET THE VIDEO IN config/video.ts. Until an id is put there this renders
 * nothing, so it is safe on the live site as it stands.
 *
 * ---------------------------------------------------------------------
 * IT IS A FACADE UNTIL IT IS CLICKED — the still and a play button, with no
 * YouTube code on the page at all. Mounting the real player costs somewhere
 * around a megabyte of their JavaScript, and this component is on SIXTEEN
 * pages: shipping that to every visitor of every one of them, for a video
 * most of them will not play, would be the single heaviest thing on the
 * site. The iframe is built on the first click and not before.
 *
 * The button is styled as YouTube's own — their rounded red rectangle — so
 * the facade reads as a video and not as a picture with a graphic on it.
 * ---------------------------------------------------------------------
 */

/* maxresdefault is a true 16:9 still, but YouTube only has it for some
   uploads. hqdefault always exists — it is a 4:3 file with the wide frame
   letterboxed inside it, so falling back to it means zooming past those
   black bars (.is-letterboxed).

   Asking for a maxresdefault that does not exist does not fail: YouTube
   answers 200 with a grey placeholder, so onError never fires. The width is
   what gives it away — the real file is 1280 across, the placeholder a
   fraction of that. */
const hi = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const lo = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export default function HelpVideo({
  id = HELP_VIDEO_ID,
  title = HELP_VIDEO_TITLE,
}: {
  /** Overrides the site-wide video for one page. Rarely wanted. */
  id?: string;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [hd, setHd] = useState(true);

  /* No id, no section — see config/video.ts. */
  if (!id) return null;

  return (
    <section className="hv">
      <div className="container">
        <div className="hv-frame">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <>
              <img
                className={`hv-still${hd ? "" : " is-letterboxed"}`}
                src={hd ? hi(id) : lo(id)}
                onError={() => setHd(false)}
                onLoad={(e) => {
                  if (hd && e.currentTarget.naturalWidth < 800) setHd(false);
                }}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <button
                type="button"
                className="hv-play"
                onClick={() => setPlaying(true)}
                aria-label={`Play video: ${title}`}
              >
                <svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true">
                  <path
                    className="hv-play-bg"
                    d="M66.5 7.7a8.6 8.6 0 0 0-6-6C55.2 0 34 0 34 0S12.8 0 7.5 1.6a8.6 8.6 0 0 0-6 6.1A89.5 89.5 0 0 0 0 24a89.5 89.5 0 0 0 1.5 16.3 8.6 8.6 0 0 0 6 6C12.8 48 34 48 34 48s21.2 0 26.5-1.6a8.6 8.6 0 0 0 6-6.1A89.5 89.5 0 0 0 68 24a89.5 89.5 0 0 0-1.5-16.3z"
                  />
                  <path d="M45 24 27 14v20z" fill="#fff" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
