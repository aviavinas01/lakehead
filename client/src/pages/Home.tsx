import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import HeroOrbit, { PlaneIcon } from "../components/HeroOrbit";
import NextSteps from "../components/NextSteps";
import VideoTestimonials from "../components/VideoTestimonials";
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

/** Student testimonials — add more entries here and the row becomes scrollable. */
const TESTIMONIALS: { quote: string; name: string; country: string }[] = [
  {
    quote:
      "I’m truly grateful for the guidance and support I received throughout my USA visa process. The team helped me understand each step clearly and prepared me thoroughly for my visa interview. What I appreciated most was the honest advice and practical guidance—I always knew what to expect and how to prepare. Their patience, professionalism, and willingness to answer every question made the entire process much less stressful. I would definitely recommend their guidance to anyone planning to study in the USA.",
    name: "Aarav",
    country: "USA",
  },
  {
    quote:
      "I had a great experience with the team throughout my study-abroad and visa application journey. A special thanks to the entire counseling team for their continuous support, clear guidance, and professional service at every stage. They were always approachable and made sure my questions were answered and my application was prepared properly. I truly appreciate their dedication and would happily recommend their services to other students planning to study abroad.",
    name: "Sanjay",
    country: "Australia",
  },
  {
    quote:
      "I had a really positive experience with the consultancy throughout my study-abroad application. From selecting the right university to preparing my documents, the team was supportive and easy to communicate with. They explained each step clearly and helped me feel confident about my application. I’m very thankful for their guidance and would definitely recommend them to other students.",
    name: "Nisha",
    country: "Australia",
  },
  {
    quote:
      "The entire process was much easier than I expected, thanks to the guidance I received from the counseling team. They helped me shortlist suitable universities, understand the requirements, and prepare my application properly. Whenever I had questions, the team was quick to respond and provide clear answers. I really appreciate their professionalism and support throughout my journey.",
    name: "Rohan",
    country: "Uk",
  },
  {
    quote:
      "I’m extremely happy with the support I received during my study-abroad journey. The counselors were patient, approachable, and genuinely focused on helping me make the right decisions. They guided me through the documentation and application process and kept me informed at every stage. It was reassuring to have a team I could rely on throughout the process.",
    name: "Sneha",
    country: "New Zealand",
  },
  {
    quote:
      "I had a smooth and positive experience with the team from the beginning of my application journey. They helped me understand the admission requirements, guided me through the documentation, and kept the process well organized. Their quick responses and friendly approach made everything much easier. I’m grateful for their support and would recommend them to anyone planning to study abroad.",
    name: "Aayush",
    country: "Canada",
  },
  {
    quote:
      "The guidance I received throughout my application process was excellent. The counselors took the time to understand my goals and helped me choose an option that suited my academic plans. They were always available to clarify my doubts and provided helpful advice whenever I needed it. I truly appreciate their dedication and support in helping me take the next step toward studying abroad.",
    name: "Srijana",
    country: "Denmark",
  },
];

export default function Home() {
  const [heroImage, setHeroImage] = useState<string>();
  const testimonialTrack = useRef<HTMLDivElement>(null);
  const helpGrid = useRef<HTMLDivElement>(null);

  const scrollTestimonials = (dir: -1 | 1) => {
    const track = testimonialTrack.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

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
        const { data } = await api.get<{ albums: Album[] }>("/albums");
        const album = data.albums.find(
          (a) => a.title.trim().toLowerCase() === HERO_ALBUM_TITLE
        );
        if (!album) return;
        const res = await api.get<{ album: Album; media: Media[] }>(
          `/albums/slug/${album.slug}`
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

      <section className="testimonials section">
        {/* Decorative plane + dashed flight trail, behind the cards */}
        <svg
          className="testimonials-decor"
          viewBox="0 0 300 260"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M42 34C74 74 92 108 138 122c52 16 104-6 108-48 3-30-36-40-49-8-14 36 20 78 84 84"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 9"
          />
          <path
            className="testimonials-plane"
            d="M12 2l2 8 8 4v2l-8-2-1 6 3 2v1l-4-1-4 1v-1l3-2-1-6-8 2v-2l8-4z"
            fill="currentColor"
          />
        </svg>
        <div className="container">
          <div className="testimonials-head">
            <div>
              <h2 className="testimonials-title">What Our Students Say</h2>
              <p className="testimonials-lead">
                Every student has a unique journey. Hear from those who have trusted us to guide their study-abroad plans and take the next step toward their international education goals.
              </p>
            </div>
            <div className="testimonials-nav">
              <button
                type="button"
                onClick={() => scrollTestimonials(-1)}
                aria-label="Previous testimonials"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollTestimonials(1)}
                aria-label="Next testimonials"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="testimonials-track" ref={testimonialTrack}>
            {TESTIMONIALS.map((t) => (
              <figure className="testimonial-card" key={t.name}>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  <span>{t.country}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <UniversityPartners />

      <NextSteps />

      <VideoTestimonials />

      <ConsultBanner />
    </>
  );
}
