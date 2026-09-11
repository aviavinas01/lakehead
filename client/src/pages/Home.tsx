import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { mediaSrc } from "../api/media";
import { PlaneIcon } from "../components/home/HeroOrbit";
import NextSteps from "../components/home/NextSteps";
import StatsStrip from "../components/home/StatsStrip";
import LegacyBand from "../components/home/LegacyBand";
import CallbackStrip from "../components/shared/CallbackStrip";
import ContactForm from "../components/shared/ContactForm";
import Destinations from "../components/home/Destinations";
import ConsultPopup from "../components/home/ConsultPopup";
import VideoTestimonials from "../components/home/VideoTestimonials";
import Testimonials from "../components/home/Testimonials";
import ConsultBanner from "../components/home/ConsultBanner";
import BlogStrip from "../components/home/BlogStrip";
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
/**
 * Whether this visitor should be sent the hero film at all.
 *
 * ------------------------------------------------------------------
 * THE FILM IS THE HEAVIEST THING ON THE SITE. It autoplays and loops, which
 * overrides `preload="metadata"` — the browser fetches the whole file to
 * play it, and keeps fetching it. On a desk that is a background; on a phone
 * on mobile data in Kathmandu it is the entire page budget several times
 * over, spent on decoration, before a word of the page has been read.
 *
 * So it is asked for rather than assumed. Three refusals, any one of which
 * falls back to the poster photograph — which is the same first frame, so
 * the hero still looks like the hero:
 *
 *   NARROW SCREENS. A phone shows a fraction of the frame anyway, cropped to
 *   a tall box. It is paying full price for a picture it mostly cannot see.
 *
 *   DATA SAVER. `saveData` is the visitor explicitly asking sites not to do
 *   this. Ignoring it is rude and, in a country where mobile data is bought
 *   in packets, expensive for them.
 *
 *   SLOW CONNECTIONS. On 2G or 3G the film would not finish buffering before
 *   most people had left, so it costs them the bandwidth and shows them
 *   nothing.
 *
 * `prefers-reduced-motion` is checked separately at the call site and was
 * always honoured — this adds the cost side of the same question.
 *
 * THE API IS NOT UNIVERSAL. `navigator.connection` is absent in Safari and
 * Firefox, so the checks below are written to fall through to "yes" when
 * they cannot tell. A visitor we know nothing about gets the film; only a
 * visitor whose browser tells us it would hurt does not.
 * ------------------------------------------------------------------
 */
function affordsVideo(): boolean {
  if (typeof window === "undefined") return false;

  /* Below this the film is cropped so hard it stops being the shot that was
     framed, quite apart from what it costs to fetch. */
  if (window.matchMedia("(max-width: 900px)").matches) return false;

  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!conn) return true;

  if (conn.saveData === true) return false;
  if (conn.effectiveType && /(^|-)(2g|3g)$/.test(conn.effectiveType)) return false;

  return true;
}

export default function Home() {
  const [heroImage, setHeroImage] = useState<string>();
  const helpGrid = useRef<HTMLDivElement>(null);

  /* ---- the hero's film ----------------------------------------------
     The clip is simply the background of the hero, full width, reaching up
     behind the header. Nothing opens, nothing closes, nothing is measured.

     It used to travel between a circle in an orbit of badges and a
     full-bleed film — first on hover, later on scroll — which meant a
     measuring pass on every resize, a set of published CSS variables, a
     body class, and a section whose appearance depended on where the page
     happened to be. The only thing that behaviour is still doing is
     changing the header, and the header already knows how to do that by
     itself on every other full-bleed page (see `overHero` in Navbar.tsx).

     A missing file falls back to the next option rather than a broken
     image: video → photo → a neutral gradient. */
  const [videoBroken, setVideoBroken] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showVideo = !videoBroken && !reduced && affordsVideo();
  const showPhoto = heroImage && !imageBroken;

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
      <section className="hero">
        {/* The section's background, and nothing more than that. */}
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
            <img
              src={heroImage}
              alt=""
              /* The one image on the site that is certainly on screen before
                 anything is scrolled, and the page's largest paint. Nothing
                 about it should be deferred. */
              loading="eager"
              {...({ fetchpriority: "high" } as Record<string, string>)}
              decoding="async"
              onError={() => setImageBroken(true)}
            />
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
        </div>
      </section>

      {/* Straddles the bottom edge of the film — 40% of the band on the
          video, the rest on the white below. It has to be a sibling of the
          hero rather than a child: .hero clips its overflow, so a band
          reaching below from inside would be cut off at the section edge.

          TWO ASKS ON THIS PAGE, ON PURPOSE. This one wants a name and a
          number and takes ten seconds; the form above the footer wants the
          whole story. They are for different readers at different points,
          not a duplicate. */}
      <CallbackStrip service="study-abroad" overlap />

      {/* Who we are. It sits between the film and the figures deliberately:
          the film says what we do, this says who is doing it, and only then
          do the numbers mean anything. It reaches nowhere near the hero, so
          the band above has that overlap zone to itself. */}
      <LegacyBand />

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
                Get the training{" "}
                <span className="h-outline">you deserve</span>
              </h2>
            </div>
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

      <NextSteps />

      <VideoTestimonials />

      <ConsultBanner />

      {/* A trailer for the blog, not a second blog page. Renders nothing at
          all until a post exists — heading included. See the component for
          why it lives here and not in Layout. */}
      <BlogStrip />

      {/* The last thing before the footer. Everything above has been an
          argument for getting in touch; this is where that is finally
          possible without leaving the page. */}
      <ContactForm source="home" />

      {/* Opens over the page a beat after it loads, once a session. Renders
          nothing until then, and nothing at all on a return visit in the same
          tab — see the component. */}
      <ConsultPopup />
    </>
  );
}
