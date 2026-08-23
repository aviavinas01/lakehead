import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import type { Album, Media, YouTubeVideo } from "../types/api";

/**
 * Where the videos in this row come from, in order of preference:
 *
 *   1. YouTube — set YOUTUBE_PLAYLIST_ID (or YOUTUBE_CHANNEL_ID) on the
 *      server and the videos in that playlist appear here. Adding one to
 *      the playlist publishes it: no upload, no deploy. The server reads
 *      YouTube's public feed and caches it (server/src/services/youtube).
 *   2. The Media Library — a published album titled "Student Reviews";
 *      each video in it becomes a card, its Title shown as the name.
 *   3. The sample clips below, so the row is never empty in development.
 *
 * YouTube cards stay as a thumbnail and a play button until they are
 * clicked. That is on purpose: an embedded player pulls in around a
 * megabyte of YouTube's own code, and loading four of those on a page
 * nobody has clicked yet is the quickest way to ruin the home page.
 */
const REVIEWS_ALBUM_TITLE = "student reviews";

/**
 * Dummy videos shown until the "Student Reviews" album has real uploads —
 * once it does, the fetched videos replace these automatically. Swap the
 * urls for files in client/public (e.g. "/videos/review1.mp4") if you want
 * local placeholders instead of these public sample clips.
 */
const DUMMY_VIDEOS: Media[] = [
  {
    _id: "dummy-1",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    title: "Aarav Sharma",
    mimeType: "video/mp4",
    size: 0,
    order: 0,
    createdAt: "",
  },
  {
    _id: "dummy-2",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    title: "Priya Koirala",
    mimeType: "video/mp4",
    size: 0,
    order: 1,
    createdAt: "",
  },
  {
    _id: "dummy-3",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    title: "Bibek Thapa",
    mimeType: "video/mp4",
    size: 0,
    order: 2,
    createdAt: "",
  },
  {
    _id: "dummy-4",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Sneha Gurung",
    mimeType: "video/mp4",
    size: 0,
    order: 3,
    createdAt: "",
  },
];

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
      <img src={video.thumbnail} alt="" loading="lazy" decoding="async" />
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

function VideoCard({
  media,
  active,
  onPlay,
}: {
  media: Media;
  active: boolean;
  onPlay: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Only one card plays at a time — pause when another card takes over. */
  useEffect(() => {
    if (!active) videoRef.current?.pause();
  }, [active]);

  const start = () => {
    onPlay();
    videoRef.current?.play();
  };

  return (
    <figure className="video-card">
      <video
        ref={videoRef}
        src={media.url}
        preload="metadata"
        playsInline
        controls={active}
      />
      {media.title && (
        <figcaption className="video-card-name">{media.title}</figcaption>
      )}
      {!active && (
        <button
          type="button"
          className="video-card-play"
          onClick={start}
          aria-label={`Play video${media.title ? ` from ${media.title}` : ""}`}
        >
          <PlayIcon />
        </button>
      )}
    </figure>
  );
}

export default function VideoTestimonials() {
  const [videos, setVideos] = useState<Media[]>(DUMMY_VIDEOS);
  const [tube, setTube] = useState<YouTubeVideo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      /* A configured YouTube source wins outright — when there is one, the
         album lookup below is skipped entirely. */
      try {
        const { data } = await api.get<{ videos: YouTubeVideo[] }>(
          "/youtube/videos",
          { quiet: true }
        );
        if (!cancelled && data.videos.length > 0) {
          setTube(data.videos);
          return;
        }
      } catch {
        /* No YouTube configured, or the feed is unreachable — fall through
           to the album, exactly as before. */
      }

      try {
        const { data } = await api.get<{ albums: Album[] }>("/albums", { quiet: true });
        const album = data.albums.find(
          (a) => a.title.trim().toLowerCase() === REVIEWS_ALBUM_TITLE
        );
        if (!album) return;
        const res = await api.get<{ album: Album; media: Media[] }>(
          `/albums/slug/${album.slug}`,
          { quiet: true }
        );
        const items = res.data.media.filter((m) => m.type === "video");
        if (!cancelled && items.length > 0) setVideos(items);
      } catch {
        /* no reviews album yet — the dummy videos stay on screen */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const showing = tube.length > 0 ? tube.length : videos.length;
  if (showing === 0) return null;

  return (
    <section className="success-stories">
      <div className="container">
        <h2 className="success-title">Your Success Story Starts Here</h2>
        <p className="success-lead">
          Join students across the globe who have achieved their study abroad
          dreams with expert guidance provided by Lakehead — from university
          admissions to visa approvals. Discover their journeys and begin
          yours today.
        </p>
        <div className="video-track-wrap">
          <button
            type="button"
            className="video-nav video-nav-prev"
            onClick={() => scroll(-1)}
            aria-label="Previous videos"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="video-track" ref={track}>
            {tube.length > 0
              ? tube.map((v) => (
                  <YouTubeCard
                    key={v.id}
                    video={v}
                    active={activeId === v.id}
                    onPlay={() => setActiveId(v.id)}
                  />
                ))
              : videos.map((m) => (
                  <VideoCard
                    key={m._id}
                    media={m}
                    active={activeId === m._id}
                    onPlay={() => setActiveId(m._id)}
                  />
                ))}
          </div>
          <button
            type="button"
            className="video-nav video-nav-next"
            onClick={() => scroll(1)}
            aria-label="Next videos"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
