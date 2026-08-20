import { useEffect, useState } from "react";
import ConsultCard from "./ConsultCard";

/**
 * "Get Ready To Begin Your Journey" — the large call-to-action band above
 * the footer: deep-blue rounded card with the copy, a Contact Us button and
 * social tiles on the left, and a cut-out photo on the right that rises
 * above the card's top edge. The button opens the free consultation form
 * in a dismissable overlay.
 *
 * The photo: drop your image at client/public/cta-student.png. A PNG with a
 * transparent background works best, since the subject overflows the card.
 * If the file is missing the photo column is simply hidden.
 */
const CTA_PHOTO = "/cta-student.png";

/* Replace the hrefs with Lakehead's real profiles. */
const SOCIALS: { label: string; href: string; className: string; icon: JSX.Element }[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    className: "is-instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    className: "is-youtube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.5 2.5 0 00-1.75-1.77C18.3 5 12 5 12 5s-6.3 0-7.85.43A2.5 2.5 0 002.4 7.2 26.3 26.3 0 002 12c0 1.6.13 3.22.4 4.8a2.5 2.5 0 001.75 1.77C5.7 19 12 19 12 19s6.3 0 7.85-.43a2.5 2.5 0 001.75-1.77c.27-1.58.4-3.2.4-4.8s-.13-3.22-.4-4.8zM10 15.2V8.8l5.4 3.2-5.4 3.2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    className: "is-linkedin",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.4 8.6H3.2V21h3.2V8.6zM4.8 3a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM13 8.6H9.9V21H13v-6.5c0-1.8.8-2.9 2.3-2.9 1.4 0 2 1 2 2.9V21h3.2v-7.2c0-3.2-1.7-5.4-4.5-5.4-1.6 0-2.6.7-3 1.6V8.6z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    className: "is-facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.7c0-.9.26-1.55 1.6-1.55h1.7V4.3c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.2h2.7V22h3.4z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/",
    className: "is-x",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.3 3h6.3l4.4 5.8L17.5 3zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3z" />
      </svg>
    ),
  },
];

export default function ConsultBanner() {
  const [open, setOpen] = useState(false);
  const [photoMissing, setPhotoMissing] = useState(false);

  /* Lock page scroll and close on Escape while the overlay is open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section className="journey-cta">
      <div className="container">
        <div className={`journey-card${photoMissing ? " no-photo" : ""}`}>
          <div className="journey-copy">
            <h2 className="journey-title">
              Get Ready To Begin
              <strong>
                Your Journey
                <span className="journey-underline" aria-hidden="true" />
              </strong>
            </h2>
            <p className="journey-lead">
              Explore more, stay informed, and start your journey to academic
              excellence.
            </p>
            <div className="journey-actions">
              <button
                type="button"
                className="journey-btn"
                onClick={() => setOpen(true)}
              >
                Contact Us
              </button>
              <div className="journey-socials">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    className={s.className}
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
          {!photoMissing && (
            <div className="journey-photo">
              <img
                src={CTA_PHOTO}
                alt=""
                onError={() => setPhotoMissing(true)}
              />
            </div>
          )}
        </div>
      </div>

      {open && (
        <div
          className="consult-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="consult-modal" role="dialog" aria-modal="true"
            aria-label="Book your free consultation">
            <button
              type="button"
              className="consult-modal-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <ConsultCard />
          </div>
        </div>
      )}
    </section>
  );
}
