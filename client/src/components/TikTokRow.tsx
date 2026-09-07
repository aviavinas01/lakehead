import { useEffect, useState } from "react";
import api from "../api/client";

/**
 * The TikTok clips, as a row of portrait cards on the home page.
 *
 * A SECTION OF ITS OWN, not mixed into the YouTube filmstrip. The two feeds
 * fail in completely different ways — YouTube is an RSS feed that can go
 * briefly empty, TikTok is a curated list that can go stale — and folding
 * them into one row would mean one source's bad day emptying the other's
 * content. Separate rows also let each keep its own heading.
 *
 * ------------------------------------------------------------------
 * NOTHING FROM TIKTOK LOADS UNTIL SOMEBODY PRESSES PLAY.
 *
 * A card is a still and a button. Only on the click does an iframe appear,
 * and it is the plain `/embed/v2/` player rather than TikTok's official
 * blockquote-plus-embed.js. That distinction is the point: their script runs
 * and sets tracking cookies the moment the page loads, whether or not anyone
 * ever watches a video, and there is no `-nocookie` variant of it the way
 * YouTube provides one. The iframe brings nothing with it until it exists.
 *
 * It is the same rule the YouTube cards and HelpVideo follow, for the same
 * reason: a home page should not ship a megabyte of somebody else's player
 * to a visitor who scrolls past.
 * ------------------------------------------------------------------
 *
 * The thumbnails are served from a signed TikTok CDN and expire; the server
 * re-asks oEmbed and writes fresh URLs back (see tiktok.service). A card
 * whose image has expired anyway falls back to its title on a plain ground
 * rather than showing a broken image.
 *
 * NO CLIPS, NO SECTION. Same rule as the YouTube row: a heading over an
 * empty shelf is worse than the page simply closing up.
 */

interface Clip {
  id: string;
  videoId: string;
  url: string;
  title: string;
  authorName: string;
  thumbnail: string;
}

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

function Card({ clip }: { clip: Clip }) {
  const [playing, setPlaying] = useState(false);
  const [noImage, setNoImage] = useState(!clip.thumbnail);

  if (playing) {
    return (
      <figure className="ttk-card" data-playing="">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${clip.videoId}`}
          title={clip.title || "TikTok video"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </figure>
    );
  }

  return (
    <figure className="ttk-card">
      {noImage ? (
        <span className="ttk-blank" aria-hidden="true" />
      ) : (
        <img
          src={clip.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          /* An expired signature 403s. The card keeps its words rather than
             showing a torn image. */
          onError={() => setNoImage(true)}
        />
      )}
      <figcaption className="ttk-cap">
        {clip.title || clip.authorName}
        {clip.authorName ? <span className="ttk-who">{clip.authorName}</span> : null}
      </figcaption>
      <button
        type="button"
        className="ttk-play"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${clip.title || "TikTok video"}`}
      >
        <PlayIcon />
      </button>
    </figure>
  );
}

export default function TikTokRow() {
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ clips: Clip[] }>("/tiktok")
      .then((res) => {
        if (!cancelled) setClips(res.data.clips ?? []);
      })
      /* A row that is briefly absent beats a row that shows an error. */
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (clips.length === 0) return null;

  return (
    <section className="ttk">
      <div className="container">
        <div className="ttk-head">
          <p className="ttk-eyebrow">On TikTok</p>
          <h2 className="ttk-title">
            Short stories from <span className="h-accent">our students</span>
          </h2>
        </div>
        {/* A plain scrollable shelf rather than a driven carousel: these are
            clips to browse, not a sequence to be walked through, and the
            wheel already scrolls a row like this on every device. */}
        <div className="ttk-row">
          {clips.map((c) => (
            <Card key={c.id} clip={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
