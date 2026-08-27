import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchGoogleRating } from "../api/googleRating";
import type { GoogleRating } from "../types/api";

/**
 * The Google reviews band that sits just above the footer on every public
 * page (added in Layout.tsx).
 *
 * It renders nothing at all until the server has real reviews to give it,
 * so before the Places API key is configured — and on any day Google is
 * unreachable — the page simply ends at the footer rather than showing an
 * empty shell. That is what makes this safe to ship ahead of deployment.
 *
 * Google returns at most five reviews and requires them to be shown as they
 * come, with the reviewer's name, photo and a link to their profile, which
 * is why each card carries all three and the band links out to the listing.
 */

const StarRow = ({ score }: { score: number }) => (
  <span className="greview-stars" aria-label={`${score} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"
        fill={n <= Math.round(score) ? "#f5b301" : "#dcdce2"}>
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
    ))}
  </span>
);

/** Google's own mark, so the source of the reviews is unmistakable. */
const GoogleG = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z" />
    <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
  </svg>
);

/**
 * The one page this band stays off. /testimonials shows the same Google
 * reviews as cards on its wall, and repeating them above the footer would
 * make the site look like it has twice as many as it does.
 */
const SUPPRESSED_ON = "/testimonials";

export default function GoogleReviews() {
  const { pathname } = useLocation();
  const [google, setGoogle] = useState<GoogleRating>();

  useEffect(() => {
    let cancelled = false;
    fetchGoogleRating().then((data) => {
      if (!cancelled) setGoogle(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Nothing to show is nothing to render — no heading, no empty band */
  if (!google || google.reviews.length === 0) return null;
  if (pathname === SUPPRESSED_ON) return null;

  return (
    <section className="greviews">
      <div className="container">
        <div className="greviews-head">
          <div>
            <p className="greviews-eyebrow">
              <GoogleG />
              Google Reviews
            </p>
            <h2 className="greviews-title">What our students say on Google</h2>
          </div>
          <div className="greviews-score">
            <strong>{google.rating.toFixed(1)}</strong>
            <div>
              <StarRow score={google.rating} />
              <span className="greviews-count">
                {google.total > 0
                  ? `${google.total.toLocaleString()} reviews`
                  : "Google rating"}
              </span>
            </div>
          </div>
        </div>

        <div className="greviews-grid">
          {google.reviews.map((r) => (
            <article className="greview" key={r.id}>
              <header className="greview-head">
                {r.photo ? (
                  <img
                    className="greview-avatar"
                    src={r.photo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="greview-avatar greview-initial" aria-hidden="true">
                    {r.author.charAt(0)}
                  </span>
                )}
                <div>
                  {r.profileUrl ? (
                    <a
                      className="greview-author"
                      href={r.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.author}
                    </a>
                  ) : (
                    <span className="greview-author">{r.author}</span>
                  )}
                  <span className="greview-when">{r.relativeTime}</span>
                </div>
              </header>
              <StarRow score={r.rating} />
              <p className="greview-text">{r.text}</p>
            </article>
          ))}
        </div>

        {google.url && (
          <a
            className="greviews-all"
            href={google.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read all reviews on Google
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}
