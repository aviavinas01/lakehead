import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import type { Album, Media } from "../types/api";

/**
 * Video testimonials are admin-managed: in the admin Media Library, create a
 * published album titled "Student Reviews" and upload videos into it — each
 * video becomes a card here, with its Title shown as the student's name.
 * The section renders nothing until that album has at least one video.
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
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

  if (videos.length === 0) return null;

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
            {videos.map((m) => (
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
