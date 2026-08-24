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
export default function ConsultBanner() {
  const [open, setOpen] = useState(false);

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
      <div className="container journey-inner">
        <h2 className="journey-title">
          Get Ready To Begin{" "}
          <span className="h-outline">Your Journey</span>
        </h2>
        <p className="journey-lead">
          Explore more, stay informed, and start your journey to academic
          excellence.
        </p>
        <button
          type="button"
          className="journey-btn"
          onClick={() => setOpen(true)}
        >
          Contact Us
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
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
