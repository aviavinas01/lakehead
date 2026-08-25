import { useRef, useState } from "react";
import type { YouTubeVideo } from "../types/api";
import { useYouTubeFeed } from "../hooks/useYouTubeFeed";

/**
 * The videos in the "Your Success Story Starts Here" row.
 *
 * YouTube is the ONLY source. Set YOUTUBE_PLAYLIST_ID on the server and the
 * videos in that playlist appear here — adding one to the playlist publishes
 * it to the site, with no upload and no deploy.
 *
 * There is deliberately no fallback content. Placeholder clips used to sit
 * behind this row, and every redeploy that caught the feed at a bad moment
 * put them back on the live site; a row that is briefly empty is far better
 * than a row that confidently shows the wrong thing. If the feed is
 * unreachable the section renders nothing at all and the page simply closes
 * up around it.
 *
 * Between them, three things make an empty row very unlikely:
 *   - the server keeps serving the last good list for as long as it takes to
 *     get a new one, and re-checks a failure within the minute rather than
 *     caching it for half an hour (services/youtube.service.ts);
 *   - it fetches once at boot, so a fresh container is warm before the first
 *     visitor arrives;
 *   - and this component retries a few times with a widening gap, which
 *     covers the seconds around a redeploy when the API is not up yet.
 *
 * Cards stay as a thumbnail and a play button until they are clicked. That
 * is on purpose: an embedded player pulls in around a megabyte of YouTube's
 * own code, and loading several of those on a page nobody has clicked yet is
 * the quickest way to ruin the home page.
 */
const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

function YouTubeCard({
  video,
  active,
  onPlay,
}: {
  video: YouTubeVideo;
  active: boolean;
  onPlay: () => void;
}) {
  /* maxresdefault is a true 16:9 file, but YouTube only has it for some
     uploads. hqdefault always exists — it is a 4:3 file with the wide
     frame letterboxed inside it, so when we fall back to it the CSS zooms
     past those black bars (.is-letterboxed).
     Asking for a maxresdefault that does not exist does not fail: YouTube
     answers 200 with a grey placeholder, so onError never fires. The size
     is what gives it away — the real file is 1280 wide, the placeholder a
     fraction of that. */
  const [hd, setHd] = useState(true);

  /* Only the card that was clicked mounts an iframe; the rest fall back to
     their thumbnail, which also unloads the player they were running. */
  if (active) {
    return (
      <figure className="video-card video-card-yt is-playing">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </figure>
    );
  }

  return (
    <figure className="video-card video-card-yt">
      <img
        className={`video-card-thumb${hd ? "" : " is-letterboxed"}`}
        src={
          hd
            ? `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`
            : video.thumbnail
        }
        onError={() => setHd(false)}
        onLoad={(e) => {
          if (hd && e.currentTarget.naturalWidth < 800) setHd(false);
        }}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <figcaption className="video-card-name">{video.title}</figcaption>
      <button
        type="button"
        className="video-card-play"
        onClick={onPlay}
        aria-label={`Play ${video.title}`}
      >
        <PlayIcon />
      </button>
    </figure>
  );
}

export default function VideoTestimonials() {
  /* Shared with the testimonial row on the Study Abroad page — same
     retry behaviour, same no-fallback rule. */
  const tube = useYouTubeFeed("stories");
  const [activeId, setActiveId] = useState<string | null>(null);
  const track = useRef<HTMLDivElement>(null);

  /* The arrows turn the shelf over a page at a time — however many cards
     are on screen at this width — rather than nudging along by one. */
  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) {
      el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
      return;
    }
    const step = card.offsetWidth + 24;
    const perView = Math.max(1, Math.round(el.clientWidth / step));
    el.scrollBy({ left: dir * step * perView, behavior: "smooth" });
  };

  /* No videos, no section — the page closes up around it rather than
     showing a heading over an empty shelf. */
  if (tube.length === 0) return null;

  return (
    <section className="success-stories">
      <div className="container">
        {/* Copy on the left, the arrows top right */}
        <div className="success-head">
          <div>
            <h2 className="success-title">
              Your <span className="h-accent">Success Story</span> Starts Here
            </h2>
            <p className="success-lead">
              Join students across the globe who have achieved their study
              abroad dreams with expert guidance provided by Lakehead — from
              university admissions to visa approvals. Discover their journeys
              and begin yours today.
            </p>
          </div>
          <div className="success-nav">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous videos"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next videos"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
        <div className="video-track-wrap">
          <div className="video-track" ref={track}>
            {tube.map((v) => (
              <YouTubeCard
                key={v.id}
                video={v}
                active={activeId === v.id}
                onPlay={() => setActiveId(v.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
