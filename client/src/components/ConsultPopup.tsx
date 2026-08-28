import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { contact } from "../config/contact";

/**
 * The free-counselling invitation that opens over the home page shortly after
 * it loads, and then not again for the rest of the visit.
 *
 * Once per session, and no more. The flag goes into sessionStorage the moment
 * the dialog is shown, so leaving the home page and coming back does not
 * bring it round a second time; sessionStorage rather than localStorage
 * because "this visit" is what was asked for, and it clears itself when the
 * tab closes. Every read and write is wrapped: a browser in private mode, or
 * with site data blocked, throws on access rather than returning null, and a
 * marketing pop-up is not worth an exception on page load. When storage is
 * unavailable the dialog simply shows once per page load.
 *
 * Two ways out and two ways on: /contact carries the enquiry form (the same
 * destination the journey band uses — see ConsultBanner.tsx for why the form
 * is a page rather than another dialog), and WhatsApp reaches a counsellor
 * now. Closing it costs one click, or Escape, or the backdrop.
 *
 * Mounted at the end of pages/Home.tsx. It renders nothing at all until it
 * decides to open, so it costs the rest of the site nothing.
 */

const SEEN_KEY = "lh:consult-popup-seen";

/* Long enough that the hero has painted and the visitor has seen what the
   site is, short enough that it does not interrupt a scroll already underway. */
const DELAY_MS = 1400;

/* Matches the closing animation in the stylesheet. The panel animates out
   before it is unmounted, which is the whole reason for the "out" state. */
const EXIT_MS = 220;

function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* Storage is blocked; the dialog just shows once per page load instead. */
  }
}

/* The same cut-off arcs as the footer band, in the same navy — the panel's
   header is a slice of the site's own pattern rather than stock decoration. */
const BannerShapes = () => (
  <svg
    className="cpop-shapes"
    viewBox="0 0 560 150"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <path d="M0,0 A44,44 0 0 1 44,44" transform="translate(-8,18) rotate(18)" />
    <path d="M0,0 L52,0" transform="translate(92,112) rotate(-38)" />
    <path d="M0,0 A38,38 0 0 1 38,38" transform="translate(188,-6) rotate(196)" />
    <path d="M0,0 A46,46 0 0 1 46,46" transform="translate(300,72) rotate(-70)" />
    <path d="M0,0 L46,0" transform="translate(392,20) rotate(36)" />
    <path d="M0,0 A40,40 0 0 1 40,40" transform="translate(470,96) rotate(150)" />
    <path d="M0,0 A48,48 0 0 1 48,48" transform="translate(534,4) rotate(-120)" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 1.83c2.16 0 4.19.84 5.72 2.37a8.04 8.04 0 012.36 5.72c0 4.46-3.63 8.08-8.09 8.08a8.2 8.2 0 01-4.17-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.05 8.05 0 01-1.23-4.29c0-4.46 3.63-8.08 8.09-8.08zm-4.4 4.3c-.2 0-.53.08-.81.38-.28.3-1.07 1.04-1.07 2.54s1.1 2.95 1.25 3.15c.15.2 2.15 3.28 5.22 4.47.73.28 1.3.45 1.74.58.73.23 1.4.2 1.93.12.59-.09 1.81-.74 2.07-1.46.26-.72.26-1.33.18-1.46-.08-.13-.28-.2-.58-.35s-1.81-.89-2.09-.99c-.28-.1-.48-.15-.68.15s-.79.99-.96 1.19c-.18.2-.36.23-.66.08s-1.29-.47-2.45-1.51c-.91-.81-1.52-1.81-1.7-2.11-.18-.3-.02-.47.13-.62.14-.14.3-.36.46-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.66-.94-2.27-.24-.58-.48-.5-.67-.51h-.57z" />
  </svg>
);

const Tick = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12.5l5 5L20 7" />
  </svg>
);

const POINTS = [
  "A counsellor who has placed students where you want to go",
  "An honest read on your profile, budget and timeline",
  "A shortlist of courses and universities to start from",
];

export default function ConsultPopup() {
  /* "hidden" renders nothing; "in" and "out" are the two halves of the
     animation, and only "out" is why this is not a plain boolean. */
  const [state, setState] = useState<"hidden" | "in" | "out">("hidden");
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setState((s) => (s === "in" ? "out" : s));
  }, []);

  /* Open once, a beat after the page settles. */
  useEffect(() => {
    if (seenThisSession()) return;
    const t = window.setTimeout(() => {
      markSeen();
      setState("in");
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  /* Unmount only after the closing animation has run. */
  useEffect(() => {
    if (state !== "out") return;
    const t = window.setTimeout(() => setState("hidden"), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [state]);

  /* While it is open it behaves as a modal dialog: the page behind does not
     scroll, Escape closes it, and Tab cycles inside the panel instead of
     wandering off into a page the visitor cannot see. Focus goes to the close
     button on open and back where it came from on close. */
  useEffect(() => {
    if (state !== "in") return;

    const returnTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;

      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      returnTo?.focus?.();
    };
  }, [state, close]);

  if (state === "hidden") return null;

  return (
    /* The backdrop closes on a click of its own, never on a click that
       started inside the panel — hence the target check rather than a
       handler on a sibling overlay. */
    <div
      className="cpop-scrim"
      data-state={state}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="cpop-panel"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cpop-title"
        aria-describedby="cpop-lead"
      >
        <button
          className="cpop-close"
          ref={closeBtn}
          type="button"
          onClick={close}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"
            aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="cpop-banner">
          <BannerShapes />
          <p className="cpop-eyebrow">Free · 30 minutes · no obligation</p>
          <h2 className="cpop-title" id="cpop-title">
            Talk to a counsellor <span>before</span> you apply
          </h2>
        </div>

        <div className="cpop-body">
          <p className="cpop-lead" id="cpop-lead">
            One conversation is usually the difference between a hopeful
            application and a strong one. Tell us where you want to study and
            we&rsquo;ll take it from there.
          </p>

          <ul className="cpop-points">
            {POINTS.map((p) => (
              <li key={p}>
                <span className="cpop-tick" aria-hidden="true"><Tick /></span>
                {p}
              </li>
            ))}
          </ul>

          <div className="cpop-actions">
            <Link className="cpop-btn" to="/contact" onClick={close}>
              Book my free session
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a
              className="cpop-btn cpop-btn-wa"
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
          </div>

          <button className="cpop-later" type="button" onClick={close}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
