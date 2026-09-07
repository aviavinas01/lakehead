import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGoogleRating, FALLBACK_RATING, GOOGLE_MAPS_URL } from "../api/googleRating";
import { SERVICES } from "../data/services";
import { SOCIALS, type SocialLink } from "../config/contact";
import type { GoogleRating } from "../types/api";
import GateDoor from "./GateDoor";

/**
 * Site footer: the brand on the left, three columns of links on the right, a
 * band of cut-off shapes beneath them, and a dark bar carrying the legal
 * links.
 *
 * The columns are drawn from what the site already offers elsewhere — the
 * destinations from the home page's grid, the services from the navbar's
 * dropdown panels, and the rest from the side drawer — so the footer stays a
 * summary of the site rather than a second, drifting set of links. Repoint
 * the `to` values as dedicated pages are built; most land on the nearest
 * page that exists today.
 */

interface FooterLink {
  label: string;
  to: string;
}

/**
 * The link columns.
 *
 * Every entry here now lands on the page it names. The services column used
 * to be seven differently-worded links all pointing at /services, and the
 * legal row pointed at the contact form — a footer that promises a page and
 * delivers something else is worse than a shorter footer.
 *
 * The services are read from data/services.ts rather than written out, so
 * the column cannot drift from what the site actually offers: add a service
 * there and it appears here, named and routed correctly, with no edit to
 * this file.
 */
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
      { label: "All destinations", to: "/study-abroad" },
    ],
  },
  {
    title: "Student services",
    links: [
      ...SERVICES.map((s) => ({ label: s.title, to: `/services/${s.slug}` })),
      { label: "All services", to: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Who we are", to: "/about" },
      /* Matches the navbar: success stories are part of the reviews wall
         now, so there is no separate entry for them here either. */
      { label: "Testimonials & reviews", to: "/testimonials" },
      { label: "University partners", to: "/university-partners" },
      { label: "Gallery", to: "/gallery" },
      { label: "Events", to: "/events" },
      { label: "Blog & articles", to: "/blog" },
      { label: "Contact us", to: "/contact" },
    ],
  },
];

/**
 * The marks for the profiles listed in config/contact.ts. The URLs live
 * there, with the rest of "how to reach Lakehead"; only the artwork is here.
 * Add a social account to that list and it needs a matching key in this map
 * — TypeScript will say so if it is missing.
 */
const SOCIAL_ICONS: Record<SocialLink["id"], JSX.Element> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.7c0-.9.26-1.55 1.6-1.55h1.7V4.3c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.2h2.7V22h3.4z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 2h-3v13.1a2.6 2.6 0 11-2.2-2.57V9.4a5.7 5.7 0 105.2 5.68V8.9a6.9 6.9 0 004 1.28V7.1a4 4 0 01-4-4V2z" />
    </svg>
  ),
};

/**
 * Terms of service, Privacy policy and Cookie policy used to sit here
 * pointing at /contact. They are out until those pages exist: a "Privacy
 * policy" link that opens a contact form is misleading rather than merely
 * unfinished, and this site collects personal data through several forms, so
 * that particular link matters more than most.
 *
 * Add the routes and put the entries back — the bar renders nothing at all
 * while this is empty, so there is no gap to design around in the meantime.
 * The consultation form's own "Privacy Policy" and "Terms & Conditions"
 * links (components/ConsultCard.tsx) are still href="#" and want the same
 * pages.
 */
const LEGAL: FooterLink[] = [];

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
            {/* The mark is a red PNG; the stylesheet turns it white here.
                It is rendered by GateDoor rather than inline because two
                clicks on it open the admin door — see that component. To
                everything else on the page it is the same image it was. */}
            <GateDoor />
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

          {/* Socials and the accreditation stamp share the foot of the brand
              column — the row is bottom-aligned, so the taller stamp rises
              alongside the blurb rather than pushing the socials down. */}
          <div className="footer-brand-foot">
            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {SOCIAL_ICONS[s.id]}
                </a>
              ))}
            </div>

            {/* ICEF accreditation seal. Static on purpose: the badge's own QR
                code is the verification route, and a link to a page we cannot
                name would be a guess. Wrap it in an <a> to ICEF's agency
                listing once that URL is known. The width/height attributes
                match the file (461×541) so the row does not jump while the
                image loads. */}
            <img
              className="footer-icef"
              src="/icef.png"
              width={461}
              height={541}
              loading="lazy"
              decoding="async"
              alt="ICEF accredited agency — ICEF agency status #5561, trusted agency"
            />
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
          {/* Omitted entirely while LEGAL is empty. An empty <nav> still
              announces itself as a "Legal" landmark to a screen reader, and
              a landmark containing nothing is worse than no landmark. */}
          {LEGAL.length > 0 && (
            <nav className="footer-legal" aria-label="Legal">
              {LEGAL.map((l) => (
                <Link key={l.label} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
