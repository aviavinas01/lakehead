import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

interface FooterLink {
  label: string;
  to: string;
}

/**
 * Footer link columns. Most entries point at the closest existing page
 * (/services, /about, …) — repoint them as dedicated pages are added.
 */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Study Abroad",
    links: [
      { label: "Study in Australia", to: "/services" },
      { label: "Study in Canada", to: "/services" },
      { label: "Study in USA", to: "/services" },
      { label: "Study in UK", to: "/services" },
      { label: "Study in New Zealand", to: "/services" },
      { label: "Study in Ireland", to: "/services" },
      { label: "Study in Germany", to: "/services" },
      { label: "Study in Dubai", to: "/services" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { label: "Education Counselling", to: "/services" },
      { label: "Test Preparation", to: "/services" },
      { label: "Application Process", to: "/services" },
      { label: "Visa Documentation Guidance", to: "/services" },
      { label: "Scholarship Guidance", to: "/services" },
      { label: "Career Counselling", to: "/services" },
    ],
  },
  {
    title: "Test Preparation",
    links: [
      { label: "IELTS", to: "/services" },
      { label: "TOEFL", to: "/services" },
      { label: "PTE", to: "/services" },
      { label: "SAT", to: "/services" },
      { label: "GRE", to: "/services" },
      { label: "GMAT", to: "/services" },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "Who We Are", to: "/about" },
      { label: "Our Services", to: "/services" },
      { label: "Advice & Blog", to: "/blog" },
      { label: "Student Testimonials", to: "/" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
];

/* Add branch cities here as Lakehead opens them. */
const BRANCHES = ["Kathmandu"];

/* Destination strip above the copyright row. */
const DESTINATIONS = [
  "Australia",
  "Canada",
  "USA",
  "UK",
  "Germany",
  "Ireland",
  "New Zealand",
  "Dubai",
];

/* Replace the hrefs with Lakehead's real profiles. */
const SOCIALS: { label: string; href: string; icon: JSX.Element }[] = [
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
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.5 2.5 0 00-1.75-1.77C18.3 5 12 5 12 5s-6.3 0-7.85.43A2.5 2.5 0 002.4 7.2 26.3 26.3 0 002 12c0 1.6.13 3.22.4 4.8a2.5 2.5 0 001.75 1.77C5.7 19 12 19 12 19s6.3 0 7.85-.43a2.5 2.5 0 001.75-1.77c.27-1.58.4-3.2.4-4.8s-.13-3.22-.4-4.8zM10 15.2V8.8l5.4 3.2-5.4 3.2z" />
      </svg>
    ),
  },
];

const Star = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#f5b301" aria-hidden="true">
    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </svg>
);

/** Google rating summary; the static values show until the server answers. */
interface GoogleRating {
  rating: number;
  total: number;
  url?: string;
  live: boolean;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [google, setGoogle] = useState<GoogleRating>({
    rating: 4.9,
    total: 0,
    live: false,
  });

  /* The score comes from the Places API via our server, which caches it —
     see server/src/services/googleRating.service.ts. */
  useEffect(() => {
    let cancelled = false;
    api
      .get<{ rating: GoogleRating }>("/google-rating", { quiet: true })
      .then(({ data }) => {
        if (!cancelled) setGoogle(data.rating);
      })
      .catch(() => {
        /* Keep the static rating if the lookup is unavailable */
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
          <span className="footer-brand-name">Lakehead Education</span>
          <p className="footer-tagline">Study abroad consultants</p>
          {/* Placeholder rating — swap in the real Google rating and count. */}
          <div className="footer-rating">
            <div className="footer-rating-score">
              <strong>{score}</strong> <span>of 5</span>
              <p>Lakehead Nepal</p>
            </div>
            <div className="footer-rating-stars">
              {/* Grey stars underneath, gold ones clipped to the score on top,
                  so a 4.6 shows six tenths of its fifth star. */}
              <span
                className="footer-stars"
                aria-label={`Rated ${score} out of 5`}
                role="img"
              >
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
              {google.total > 0 ? (
                <p>
                  {google.url ? (
                    <a href={google.url} target="_blank" rel="noopener noreferrer">
                      {google.total} reviews on Google
                    </a>
                  ) : (
                    `${google.total} reviews on Google`
                  )}
                </p>
              ) : (
                <p>Reviews on Google</p>
              )}
            </div>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav className="footer-col" key={col.title} aria-label={col.title}>
            <h4>{col.title}</h4>
            {col.links.map((l) => (
              <Link key={l.label} to={l.to}>{l.label}</Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="container footer-branches">
        <div />
        <div className="footer-col">
          <h4>Our Branches</h4>
          {BRANCHES.map((b) => (
            <Link key={b} to="/contact">{b}</Link>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="footer-divider" />
        <div className="footer-destinations">
          {DESTINATIONS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="footer-bottom">
          <div>
            <p className="footer-copyright">Copyright ©{year} – Lakehead Education</p>
            {/* Convert these to links once the legal pages exist. */}
            <div className="footer-legal">
              <span>Disclaimer</span>
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
            </div>
          </div>
          <div className="footer-social">
            <p>Let&rsquo;s get social.</p>
            <div className="footer-social-icons">
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
        </div>
      </div>
    </footer>
  );
}
