import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGoogleRating, FALLBACK_RATING, GOOGLE_MAPS_URL } from "../api/googleRating";
import type { GoogleRating } from "../types/api";

/**
 * Site footer: the brand on the left, three columns of links on the right, a
 * band of cut-off shapes beneath them, and a dark bar carrying the legal
 * links.
 *
 * The columns are drawn from what the site already offers elsewhere — the
 * destinations from the globe section, the services from the navbar's
 * dropdown panels, and the rest from the side drawer — so the footer stays a
 * summary of the site rather than a second, drifting set of links. Repoint
 * the `to` values as dedicated pages are built; most land on the nearest
 * page that exists today.
 */

interface FooterLink {
  label: string;
  to: string;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Destinations",
    links: [
      { label: "United Kingdom", to: "/study-in-uk" },
      { label: "United States", to: "/study-in-usa" },
      { label: "Australia", to: "/study-in-australia" },
      { label: "Canada", to: "/study-in-canada" },
      { label: "New Zealand", to: "/study-in-new-zealand" },
      { label: "South Korea", to: "/study-in-south-korea" },
    ],
  },
  {
    title: "Quick links",
    links: [
      { label: "Education counselling", to: "/services" },
      { label: "Test preparation", to: "/services" },
      { label: "Visa guidance", to: "/services" },
      { label: "Scholarships", to: "/services" },
      { label: "Interview preparation", to: "/services" },
      { label: "Student accommodation", to: "/services" },
      { label: "Useful documents", to: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Who we are", to: "/about" },
      { label: "Success stories", to: "/about" },
      { label: "Testimonials & reviews", to: "/about" },
      { label: "University partners", to: "/about" },
      { label: "Gallery", to: "/" },
      { label: "Events", to: "/blog" },
      { label: "News", to: "/blog" },
      { label: "Blog & articles", to: "/blog" },
      { label: "Contact us", to: "/contact" },
    ],
  },
];

/* Replace the hrefs with Lakehead's real profiles. */
const SOCIALS: { label: string; href: string; icon: JSX.Element }[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.4 8.6H3.2V21h3.2V8.6zM4.8 3a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM13 8.6H9.9V21H13v-6.5c0-1.8.8-2.9 2.3-2.9 1.4 0 2 1 2 2.9V21h3.2v-7.2c0-3.2-1.7-5.4-4.5-5.4-1.6 0-2.6.7-3 1.6V8.6z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.7c0-.9.26-1.55 1.6-1.55h1.7V4.3c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.2h2.7V22h3.4z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.5 2.5 0 00-1.75-1.77C18.3 5 12 5 12 5s-6.3 0-7.85.43A2.5 2.5 0 002.4 7.2 26.3 26.3 0 002 12c0 1.6.13 3.22.4 4.8a2.5 2.5 0 001.75 1.77C5.7 19 12 19 12 19s6.3 0 7.85-.43a2.5 2.5 0 001.75-1.77c.27-1.58.4-3.2.4-4.8s-.13-3.22-.4-4.8zM10 15.2V8.8l5.4 3.2-5.4 3.2z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const LEGAL: FooterLink[] = [
  { label: "Terms of service", to: "/contact" },
  { label: "Privacy policy", to: "/contact" },
  { label: "Cookie policy", to: "/contact" },
];

/**
 * The band of shapes above the legal bar. Each is a thick round-capped arc or
 * bar, scattered and turned at odd angles, and the band's overflow cuts the
 * ones that reach its edges — which is what stops it reading as a tidy row of
 * icons and makes it read as a pattern the page happens to pass through.
 */
const SHAPES: { d: string; x: number; y: number; rot: number; s: number }[] = [
  { d: "M0,0 A50,50 0 0 1 50,50", x: -14, y: 44, rot: 24, s: 1 },
  { d: "M0,0 L62,0", x: 96, y: 128, rot: -42, s: 1 },
  { d: "M0,0 A44,44 0 0 1 44,44", x: 168, y: 6, rot: 198, s: 1.05 },
  { d: "M0,0 A54,54 0 0 1 54,54", x: 272, y: 84, rot: -68, s: 0.95 },
  { d: "M0,0 L52,0", x: 368, y: 26, rot: 34, s: 1 },
  { d: "M0,0 A46,46 0 0 1 46,46", x: 442, y: 122, rot: 152, s: 1 },
  { d: "M0,0 A56,56 0 0 1 56,56", x: 548, y: 40, rot: -122, s: 1 },
  { d: "M0,0 L56,0", x: 646, y: 142, rot: 64, s: 1 },
  { d: "M0,0 A48,48 0 0 1 48,48", x: 726, y: 12, rot: 96, s: 1.05 },
  { d: "M0,0 A50,50 0 0 1 50,50", x: 828, y: 96, rot: -26, s: 0.95 },
  { d: "M0,0 L50,0", x: 928, y: 30, rot: -74, s: 1 },
  { d: "M0,0 A45,45 0 0 1 45,45", x: 992, y: 128, rot: 176, s: 1 },
  { d: "M0,0 A56,56 0 0 1 56,56", x: 1092, y: 44, rot: -158, s: 1 },
  { d: "M0,0 L58,0", x: 1198, y: 112, rot: 18, s: 1 },
];

const Star = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="#f5b301" aria-hidden="true">
    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  const [google, setGoogle] = useState<GoogleRating>(FALLBACK_RATING);

  /* The score comes from the Places API via our server, which caches it —
     see server/src/services/googleRating.service.ts. The request is shared
     with the reviews band above the footer, so the page only makes one. */
  useEffect(() => {
    let cancelled = false;
    fetchGoogleRating().then((data) => {
      if (!cancelled) setGoogle(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const score = google.rating.toFixed(1);

  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            {/* The mark is a red PNG; the stylesheet turns it white here */}
            <img src="/drawer-logo.png" alt="" />
            <span>Lakehead Education</span>
          </div>
          <p className="footer-blurb">
            Navigating the path to global higher education can be complex, but
            you don&rsquo;t have to do it alone. Whatever your ambition, our
            counsellors guide you through every step — choosing a course,
            preparing the application, and landing at your university.
          </p>

          {/* Score, stars and count are one link: anywhere in the block
              opens our listing on Google. The pieces inside are hidden from
              screen readers so the link reads as a single sentence. */}
          <a
            className="footer-rating"
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              `Rated ${score} out of 5 on Google` +
              (google.total > 0 ? ` from ${google.total.toLocaleString()} reviews` : "") +
              " — open our listing on Google Maps"
            }
          >
            <strong aria-hidden="true">{score}</strong>
            <span className="footer-stars" aria-hidden="true">
              <span className="footer-stars-empty">
                <Star /><Star /><Star /><Star /><Star />
              </span>
              <span
                className="footer-stars-fill"
                style={{ width: `${(google.rating / 5) * 100}%` }}
              >
                <Star /><Star /><Star /><Star /><Star />
              </span>
            </span>
            <span className="footer-rating-note" aria-hidden="true">
              {google.total > 0
                ? `${google.total.toLocaleString()} reviews on Google`
                : "Reviews on Google"}
            </span>
            <svg className="footer-rating-arrow" viewBox="0 0 24 24" width="15" height="15"
              fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>

          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-cols">
          {COLUMNS.map((col) => (
            <nav className="footer-col" key={col.title} aria-label={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="footer-shapes" aria-hidden="true">
        <svg viewBox="0 0 1240 170" preserveAspectRatio="xMidYMid slice">
          {SHAPES.map((s, i) => (
            <path
              key={i}
              d={s.d}
              transform={`translate(${s.x},${s.y}) rotate(${s.rot}) scale(${s.s})`}
            />
          ))}
        </svg>
      </div>

      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <p>© Copyright {year} Lakehead Education. All rights reserved.</p>
          <nav className="footer-legal" aria-label="Legal">
            {LEGAL.map((l) => (
              <Link key={l.label} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
