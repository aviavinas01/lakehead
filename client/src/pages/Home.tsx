import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { mediaSrc } from "../api/media";
import HeroOrbit, { PlaneIcon } from "../components/HeroOrbit";
import NextSteps from "../components/NextSteps";
import StatsStrip from "../components/StatsStrip";
import Destinations from "../components/Destinations";
import ConsultPopup from "../components/ConsultPopup";
import VideoTestimonials from "../components/VideoTestimonials";
import Testimonials from "../components/Testimonials";
import ConsultBanner from "../components/ConsultBanner";
import UniversityPartners from "../components/UniversityPartners";
import type { Album, Media } from "../types/api";

/**
 * The hero photo is admin-managed: in the admin Media Library, create a
 * published album titled "Home Hero" and upload an image into it — the
 * first image of that album becomes the round hero photo.
 */
const HERO_ALBUM_TITLE = "home hero";

/**
 * The clip that plays in the hero circle — muted, looping, and used as the
 * fallback when no "Home Hero" album exists, which is why the circle sits
 * empty without it. An admin-uploaded image becomes its poster frame.
 * Set to undefined to go back to a still photo only.
 */
const HERO_VIDEO = "/hero.mp4";

/**
 * "How we help clients" cards — set each `image` to your file's path
 * (e.g. "/citizenship.png") once the photos are in client/public.
 * Until then a neutral placeholder panel is shown in its place.
 */
const HELP_CARDS: {
  title: string;
  text: string;
  image?: string;
  /** Side the card eases in from when the row scrolls into view */
  from: "left" | "bottom" | "right";
}[] = [
  { title: "Citizenship Test", text: "Access practice questions, study guides…", image: "/help/citizenship-test.jpg", from: "left" },
  { title: "TOEFL Coaching", text: "Access practice questions, study guides…", image: "/help/toefl.jpg", from: "bottom" },
  { title: "Take IELTS", text: "Access practice questions, study guides…", image: "/help/ielts.jpg", from: "right" },
];


/** Student testimonials — add more entries here and the row becomes scrollable. */
export default function Home() {
  const [heroImage, setHeroImage] = useState<string>();
  const helpGrid = useRef<HTMLDivElement>(null);

  /* ---- the hero's opening video -------------------------------------
     At rest the clip sits in the circle inside HeroOrbit. Resting the
     pointer on it opens it out until it is the background of the whole
     section; leaving the circle closes it again.

     The layer is a child of <section className="hero"> rather than of
     HeroOrbit, because it has to grow past HeroOrbit's bounds and an
     element cannot escape its containing block. Its resting geometry is
     measured from the empty `.hero-photo-slot` marker HeroOrbit leaves
     behind, and published as CSS variables — so the closed state lands
     exactly on the circle at any window size, with nothing hardcoded. */
  const heroSection = useRef<HTMLElement>(null);
  const photoSlot = useRef<HTMLDivElement>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  /* A missing file falls back to the next option rather than a broken
     image: video → photo → the neutral circle. */
  const [videoBroken, setVideoBroken] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showVideo = !videoBroken && !reduced;
  const showPhoto = heroImage && !imageBroken;

  /* Measured on mount and whenever the layout can change. Reading the slot
     rather than recomputing the orbit's arithmetic means this cannot drift
     out of step with the stylesheet. */
  useEffect(() => {
    const section = heroSection.current;
    const slot = photoSlot.current;
    if (!section || !slot) return;
    const measure = () => {
      const s = section.getBoundingClientRect();
      const p = slot.getBoundingClientRect();
      section.style.setProperty("--media-x", `${p.left - s.left}px`);
      section.style.setProperty("--media-y", `${p.top - s.top}px`);
      section.style.setProperty("--media-size", `${p.width}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(slot);
    return () => ro.disconnect();
  }, []);

  /* Scrolling wins outright over hovering, and keeps winning briefly after,
     so the video cannot open under a cursor that never moved — scrolling
     re-runs hit-testing and would otherwise fire a fresh pointerenter. */
  const settleAt = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      settleAt.current = Date.now() + 350;
      setMediaOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const openMedia = () => {
    if (Date.now() < settleAt.current) return;
    setMediaOpen(true);
  };

  /* The film reaches up over the header as well, so the header has to get
     out of its own way — this class turns it transparent and its type white,
     the same treatment the destination pages use. It goes on <body> because
     the navbar is a sibling of this page, not a descendant of it. */
  useEffect(() => {
    document.body.classList.toggle("hero-film", mediaOpen);
    return () => document.body.classList.remove("hero-film");
  }, [mediaOpen]);

  /* The three "how we help" cards settle in from their own side the first
     time the row is scrolled to. One observer on the row, so the cards move
     together as a set rather than each waiting its own turn. Without this
     the cards never get .in-view and stay at the opacity: 0 the stylesheet
     starts them at — an invisible row under a visible heading. */
  useEffect(() => {
    const grid = helpGrid.current;
    if (!grid) return;
    const show = () => grid.classList.add("in-view");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show();
        io.disconnect();
      },
      { threshold: 0.25 }
    );
    io.observe(grid);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<{ albums: Album[] }>("/albums");
        const album = data.albums.find(
          (a) => a.title.trim().toLowerCase() === HERO_ALBUM_TITLE
        );
        if (!album) return;
        const res = await api.get<{ album: Album; media: Media[] }>(
          `/albums/slug/${album.slug}`
        );
        const image = res.data.media.find((m) => m.type === "image");
        if (image && !cancelled) setHeroImage(mediaSrc(image.url));
      } catch {
        /* no hero album yet — the placeholder circle is shown instead */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section
        className={`hero${mediaOpen ? " is-media-open" : ""}`}
        ref={heroSection}
      >
        {/* Closed, this is the circle inside the orbit; open, it is the
            section's background. Only the box animates — one absolutely
            positioned element, so nothing else on the page reflows. */}
        <div className="hero-media" aria-hidden="true">
          {showVideo ? (
            <video
              src={HERO_VIDEO}
              poster={showPhoto ? heroImage : undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoBroken(true)}
            />
          ) : showPhoto ? (
            <img src={heroImage} alt="" onError={() => setImageBroken(true)} />
          ) : (
            <div className="hero-photo-placeholder" />
          )}
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Your Goals. Your Journey. Our Guidance.
            </p>
            <h1>
              Wherever you want to study,{" "}
              <span className="h-accent">we’ll help you get there</span>
            </h1>
            <p className="hero-lead">
              From choosing the right course and university to preparing your application and visa, our counsellors are here to guide you through each step with honest advice and no unnecessary complications.
            </p>
            <div className="hero-actions">
              <Link to="/services" className="btn btn-outline">Explore Destinations →</Link>
              <Link to="/contact" className="btn btn-outline">Talk to Us →</Link>
            </div>
          </div>
          <HeroOrbit
            open={mediaOpen}
            onOpen={openMedia}
            onClose={() => setMediaOpen(false)}
            slotRef={photoSlot}
          />
        </div>
      </section>

      <StatsStrip />

      <Destinations />

      <section className="help">
        <div className="container">
          <div className="help-head">
            <div>
              <p className="hero-eyebrow">
                <span className="hero-eyebrow-icon"><PlaneIcon /></span>
                How We Help Clients
              </p>
              <h2 className="help-title">
                Get the immigration training{" "}
                <span className="h-outline">you deserve</span>
              </h2>
            </div>
            <p className="help-lead">
              We provide a skilled staff to help you get the most out of your
              immigration. Our qualified and dependable Immigration Consultants
              can assist you.
            </p>
          </div>
          <div className="help-grid" ref={helpGrid}>
            {HELP_CARDS.map((c) => (
              <div className={`help-card from-${c.from}`} key={c.title}>
                {c.image ? (
                  <img src={c.image} alt={c.title} loading="lazy" decoding="async" />
                ) : (
                  <div className="help-placeholder" />
                )}
                <div className="help-panel">
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                  <Link
                    to="/services"
                    className="help-arrow"
                    aria-label={`Learn more about ${c.title}`}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <UniversityPartners />

      <NextSteps />

      <VideoTestimonials />

      <ConsultBanner />

      {/* Opens over the page a beat after it loads, once a session. Renders
          nothing until then, and nothing at all on a return visit in the same
          tab — see the component. */}
      <ConsultPopup />
    </>
  );
}
