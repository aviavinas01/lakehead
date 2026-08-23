import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import HeroOrbit, { PlaneIcon } from "../components/HeroOrbit";
import NextSteps from "../components/NextSteps";
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
 * Shown in the hero circle until (or unless) a "Home Hero" album exists —
 * just drop the file at client/public/hero.jpg. An admin-uploaded image
 * always wins over this one.
 */
const HERO_FALLBACK = "/hero.jpg";

/**
 * Optional clip for the hero circle — drop the file at client/public/hero.mp4
 * and it plays there muted and looping, using the image above as its poster.
 * Set this to undefined to go back to the still photo.
 */
const HERO_VIDEO = "/hero.mp4";

/**
 * "How we help clients" cards — set each `image` to your file's path
 * (e.g. "/citizenship.jpg") once the photos are in client/public.
 * Until then a neutral placeholder panel is shown in its place.
 */
const HELP_CARDS: {
  title: string;
  text: string;
  image?: string;
  /** Side the card eases in from when the section scrolls into view */
  from: "left" | "bottom" | "right";
}[] = [
  { title: "Citizenship Test", text: "Access practice questions, study guides…", image: "/help/citizenship-test.jpg", from: "left" },
  { title: "TOEFL Coaching", text: "Access practice questions, study guides…", image: "/help/toefl.jpg", from: "bottom" },
  { title: "Take IELTS", text: "Access practice questions, study guides…", image: "/help/ielts.jpg", from: "right" },
];

/**
 * Destination cards — set each `image` to your file's path
 * (e.g. "/images/destinations/usa.jpg"). Until then a neutral
 * placeholder panel is shown in its place.
 */
const DESTINATIONS: { name: string; image?: string }[] = [
  { name: "USA", image: "/usa.jpg" },
  { name: "UK", image: "/uk.jpg"},
  { name: "Australia", image: "/australia.jpg" },
  { name: "Germany", image: "/germany.jpg" },
  { name: "Ireland", image: "/ireland.jpg" },
  { name: "New Zealand", image: "/newzealand.jpg" },
  { name: "Dubai", image: "/dubai.jpg" },
  { name: "Canada", image: "/canada.jpg" },
];

export default function Home() {
  const [heroImage, setHeroImage] = useState<string>();
  const helpGrid = useRef<HTMLDivElement>(null);

  /* The three "how we help" cards settle in from their own side the first
     time the row is scrolled to. One observer on the row, so the cards move
     together as a set rather than each waiting its own turn. */
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
        const { data } = await api.get<{ albums: Album[] }>("/albums", { quiet: true });
        const album = data.albums.find(
          (a) => a.title.trim().toLowerCase() === HERO_ALBUM_TITLE
        );
        if (!album) return;
        const res = await api.get<{ album: Album; media: Media[] }>(
          `/albums/slug/${album.slug}`,
          { quiet: true }
        );
        const image = res.data.media.find((m) => m.type === "image");
        if (image && !cancelled) setHeroImage(image.url);
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
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Trusted Immigration Partner
            </p>
            <h1>Our straightforward approach to the immigration process</h1>
            <p className="hero-lead">
              With experienced consultants and registered professionals by your side, we guide you through every stage of your visa application with clarity and confidence.
            </p>
            <div className="hero-actions">
              <Link to="/services" className="btn btn-outline">Discover Solutions</Link>
              <Link to="/contact" className="btn btn-outline">Book A Consultation</Link>
            </div>
          </div>
          <HeroOrbit imageUrl={heroImage ?? HERO_FALLBACK} videoUrl={HERO_VIDEO} />
        </div>
      </section>

      <section className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <strong>1,100+</strong>
              <span>Institution Partners</span>
            </div>
            <div className="stat">
              <strong>760,000+</strong>
              <span>Students Assisted</span>
            </div>
            <div className="stat">
              <strong>200,000+</strong>
              <span>Institution Courses Offered</span>
            </div>
            <div className="stat">
              <strong>10+</strong>
              <span>Destinations Served</span>
            </div>
          </div>
          <p className="stats-note">(As of Mar'25)*</p>
        </div>
      </section>

      <section className="destinations">
        <div className="container">
          <h2 className="destinations-title">
            Your Journey to Global Education Starts Here
          </h2>
          <p className="destinations-lead">
            Explore leading study destinations including Australia, the USA, Canada, the UK, and more. Our experts help you discover the right universities, scholarships, and opportunities to turn your study-abroad plans into reality.
          </p>
          <div className="destinations-grid">
            {DESTINATIONS.map((d) => (
              <div className="destination-card" key={d.name}>
                {d.image ? (
                  <img src={d.image} alt={d.name} loading="lazy" decoding="async" />
                ) : (
                  <div className="destination-placeholder" />
                )}
                <span className="destination-name">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="help">
        <div className="container">
          <div className="help-head">
            <div>
              <p className="hero-eyebrow">
                <span className="hero-eyebrow-icon"><PlaneIcon /></span>
                How We Help Clients
              </p>
              <h2 className="help-title">
                Get the immigration training you deserve
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
    </>
  );
}
