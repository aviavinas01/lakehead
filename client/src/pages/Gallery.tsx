import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "../components/destinationBits";
import { fetchGallery, type GalleryAlbum, type GalleryImage } from "../api/gallery";
import { PLACEHOLDER_ALBUMS } from "../data/gallery";
import { armReveals } from "../lib/reveal";
import HelpVideo from "../components/HelpVideo";
import CallbackStrip from "../components/CallbackStrip";

/**
 * Gallery — /gallery.
 *
 * EVERY IMAGE ON THIS PAGE COMES FROM THE ADMIN. There is no hard-coded
 * photograph and no per-section image list to maintain. One published album
 * is one section: its title is the display heading, its description the
 * standfirst, its media the mosaic, and the album's `order` decides where it
 * lands on the page. Adding a section to this gallery is creating an album;
 * reordering the page is dragging a number. See api/gallery.ts for what the
 * backend already supports and the one field the admin screen has yet to
 * expose.
 *
 * THREE THINGS MAKE IT LOOK COMPOSED RATHER THAN DUMPED.
 *
 * 1. The ribbon. Two tightly-packed rows that slide in opposite directions
 *    as the page scrolls past them, so the first thing you meet after the
 *    heading is photographs in motion rather than a grid. It is driven by
 *    the section's own progress through the viewport, not by a timer, so it
 *    tracks the reader instead of running away from them.
 *
 * 2. The mosaic. Sizes are assigned by position, not stored per image, on a
 *    repeating six-step cycle — so an album of four photographs and an album
 *    of forty both come out varied, and nobody has to tag anything "large".
 *
 * 3. Nothing is cropped to a square. Each tile keeps a generous aspect ratio
 *    and covers it, which is what stops a wall of portraits and landscapes
 *    from reading as a contact sheet.
 *
 * BEFORE ANYTHING IS PUBLISHED the page falls back to the placeholder albums
 * in data/gallery.ts — a gallery is the one page that cannot degrade to
 * nothing. The swap is wholesale: real albums and placeholders never mix.
 */

/** Images per ribbon row. Enough to fill a wide screen twice over. */
const RIBBON_ROW = 14;

/** How far each ribbon row travels across its section, as a share of width. */
const RIBBON_TRAVEL = 0.16;

function Tile({
  image,
  index,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  onOpen: () => void;
}) {
  const [broken, setBroken] = useState(false);

  /* A file that 404s is dropped rather than left as a torn-image icon. The
     mosaic reflows around the gap, which is the right outcome — a deleted
     upload should not leave a hole with an icon in it. */
  if (broken) return null;

  return (
    <button
      type="button"
      className="gal-tile"
      data-slot={index % 10}
      onClick={onOpen}
      aria-label={image.title ? `Open ${image.title}` : "Open image"}
    >
      <img
        src={image.src}
        alt={image.title ?? ""}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
      {image.title || image.caption ? (
        <span className="gal-tile-cap">{image.title ?? image.caption}</span>
      ) : null}
    </button>
  );
}

/** The lightbox. Arrow keys and Escape, and it locks the page behind it. */
function Lightbox({
  images,
  index,
  onMove,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onMove: (next: number) => void;
  onClose: () => void;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const image = images[index];

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onMove((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onMove((index + 1) % images.length);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [index, images.length, onMove, onClose]);

  if (!image) return null;

  return (
    <div
      className="gal-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.title ?? "Gallery image"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="gal-lb-close"
        onClick={onClose}
        ref={closeBtn}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          className="gal-lb-nav gal-lb-prev"
          onClick={() => onMove((index - 1 + images.length) % images.length)}
          aria-label="Previous image"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : null}

      <figure className="gal-lb-figure">
        {/* Keyed on the image so a new one fades in rather than swapping */}
        <img key={image.id} src={image.src} alt={image.title ?? ""} />
        {image.title || image.caption || image.album ? (
          <figcaption>
            {image.title ? <strong>{image.title}</strong> : null}
            {image.caption ? <span>{image.caption}</span> : null}
            {image.album ? <em>{image.album}</em> : null}
          </figcaption>
        ) : null}
      </figure>

      {images.length > 1 ? (
        <button
          type="button"
          className="gal-lb-nav gal-lb-next"
          onClick={() => onMove((index + 1) % images.length)}
          aria-label="Next image"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      ) : null}

      {images.length > 1 ? (
        <p className="gal-lb-count">
          {index + 1} / {images.length}
        </p>
      ) : null}
    </div>
  );
}

export default function Gallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[] | null>(null);
  const [live, setLive] = useState(false);
  const [open, setOpen] = useState<{ album: number; index: number } | null>(null);

  /* Tiles rise in as each album is scrolled to, once per visit. armReveals
     sweeps positions rather than watching for intersection changes, so a
     jump to an anchor or a restored scroll position cannot leave a whole
     album stranded invisible — which on a page that is nothing but pictures
     would be the entire page. Re-run when the albums land, because until
     the fetch resolves there are no tiles to find. */
  const albumsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = albumsRef.current;
    if (!el) return;
    return armReveals(el, ".gal-tile");
  }, [albums]);

  const ribbon = useRef<HTMLDivElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Gallery | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchGallery()
      .then((data) => {
        if (cancelled) return;
        /* Wholesale swap. A page that mixed two real albums with two
           placeholders would be actively misleading. */
        if (data.length > 0) {
          setAlbums(data);
          setLive(true);
        } else {
          setAlbums(PLACEHOLDER_ALBUMS);
        }
      })
      .catch(() => {
        if (!cancelled) setAlbums(PLACEHOLDER_ALBUMS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Every image on the page, flattened — the ribbon draws from all albums so
     it is a sample of the whole gallery rather than of whichever one happens
     to be first. */
  const all = useMemo(
    () => (albums ?? []).flatMap((a) => a.images),
    [albums]
  );

  const rows = useMemo(() => {
    if (all.length === 0) return { a: [], b: [] };
    /* Repeat the list until each row is full, so a gallery of five images
       still fills the ribbon rather than leaving it half empty. */
    const take = (offset: number) =>
      Array.from({ length: RIBBON_ROW }, (_, i) => all[(i + offset) % all.length]);
    return { a: take(0), b: take(Math.ceil(all.length / 2)) };
  }, [all]);

  /* The ribbon is driven by the section's own progress through the viewport
     rather than by a timer: -1 when it is below the fold, 0 in the middle,
     +1 once it has passed. Written straight to the transform on an rAF, so
     the scroll listener never does layout work and React never re-renders on
     scroll — a state update per frame here would be the most expensive thing
     on the page. */
  useEffect(() => {
    const section = ribbon.current;
    if (!section || all.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      /* 0 as the section enters from below, 1 as it leaves at the top */
      const progress = span > 0 ? (window.innerHeight - rect.top) / span : 0.5;
      const shift = (progress - 0.5) * 2 * RIBBON_TRAVEL * 100;
      if (rowA.current) rowA.current.style.transform = `translate3d(${-shift}%, 0, 0)`;
      if (rowB.current) rowB.current.style.transform = `translate3d(${shift}%, 0, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [all.length]);

  const move = useCallback(
    (next: number) => setOpen((cur) => (cur ? { ...cur, index: next } : cur)),
    []
  );

  const openAlbum = open != null ? albums?.[open.album] : undefined;

  return (
    <article className="dpage dpage-ruled gal">
      {/* ---- header ----
          Type, not a photograph. Every other page on the site opens with a
          hero image; this one should not, because the first photographs a
          visitor sees here ought to be the gallery's own. */}
      <header className="gal-head">
        <div className="container">
          <p className="dpage-eyebrow-sm">Gallery</p>
          <h1 className="gal-title">
            <span className="gal-thin">Fifteen years of</span>
            <span className="gal-fat">offer letters,</span>
            <span className="gal-fat gal-fat-2">departure days</span>
            <span className="gal-accent">and a very busy office.</span>
          </h1>
          <p className="gal-lead">
            The counselling floor on an intake deadline. Test-prep classes at
            seven in the morning. Students who came back to say hello, and the
            wall of postcards they keep adding to. This is what the work
            actually looks like from the inside.
          </p>
        </div>
      </header>

      {/* ---- the scroll ribbon ---- */}
      {all.length > 0 ? (
        <section className="gal-ribbon" ref={ribbon} aria-hidden="true">
          <div className="gal-ribbon-row" ref={rowA}>
            {rows.a.map((img, i) => (
              <span className="gal-ribbon-cell" key={`a-${i}-${img.id}`}>
                <img src={img.src} alt="" loading="lazy" decoding="async" />
              </span>
            ))}
          </div>
          <div className="gal-ribbon-row gal-ribbon-row-b" ref={rowB}>
            {rows.b.map((img, i) => (
              <span className="gal-ribbon-cell" key={`b-${i}-${img.id}`}>
                <img src={img.src} alt="" loading="lazy" decoding="async" />
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {albums === null ? (
        <div className="container gal-status">Loading the gallery…</div>
      ) : null}

      {/* ---- one section per album ----
          `data-tint` alternates the ground by the album's own position. A
          CSS :nth-child would count the header, the ribbon and the CTA as
          siblings too, and tint the wrong sections. */}
      {/* A wrapper purely to give the tile reveal a root of its own. It adds
          no layout — the sections inside stay full-bleed — and it keeps
          `data-reveal-armed` off the <article>, where PageReveal already
          puts one for the headings. Two arms on one element would mean the
          first cleanup to run stripped the flag the other still needed. */}
      <div className="gal-albums" ref={albumsRef}>
      {(albums ?? []).map((album, ai) => (
        <section className="gal-album" key={album.id} data-tint={ai % 2 === 1 || undefined}>
          <div className="container">
            <header className="gal-album-head">
              <span className="gal-album-n" aria-hidden="true">
                {String(ai + 1).padStart(2, "0")}
              </span>
              <h2 className="gal-album-title">{album.title}</h2>
              {album.description ? (
                <p className="gal-album-lead">{album.description}</p>
              ) : null}
              <span className="gal-album-count">
                {album.images.length} {album.images.length === 1 ? "photograph" : "photographs"}
              </span>
            </header>

            <div className="gal-mosaic">
              {album.images.map((img, i) => (
                <Tile
                  key={img.id}
                  image={img}
                  index={i}
                  onOpen={() => setOpen({ album: ai, index: i })}
                />
              ))}
            </div>
          </div>
        </section>
      ))}
      </div>

      {albums !== null && !live ? (
        <div className="container">
          <p className="gal-placeholder-note">
            These are stand-in photographs. Publish an album in the media
            library and this page replaces them with it.
          </p>
        </div>
      ) : null}

      <CallbackStrip service="other" />

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Come and see it in person.</h2>
            <p>The office is open Sunday to Friday, and you do not need an appointment.</p>
          </div>
          <Link className="dpage-cta-btn" to="/about#find-us">
            Find us in Kathmandu <Arrow />
          </Link>
        </div>
      </section>
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />

      {open && openAlbum ? (
        <Lightbox
          images={openAlbum.images}
          index={open.index}
          onMove={move}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </article>
  );
}
