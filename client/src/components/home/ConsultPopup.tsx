import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { contact } from "../../config/contact";

/**
 * The free-counselling offer: a two-panel dialog over a blurred, frozen page.
 *
 * A picture on the left, the offer on the right, 800 × 505 — the proportions
 * of the reference this was built to.
 *
 * IT IS A REAL DIALOG, so it does the things a dialog owes the person it
 * interrupts: the page behind it is inert and cannot scroll, Escape closes
 * it, clicking the backdrop closes it, focus moves into it on arrival and
 * returns to where it was on the way out, and Tab cycles inside it rather
 * than wandering off into a page nobody can see. Taking the screen and then
 * leaving the keyboard behind it is the worst of both.
 *
 * Once per visit. The flag goes into sessionStorage the moment it is shown,
 * so moving between pages does not bring it round again; sessionStorage
 * rather than localStorage because "this visit" is what was asked for, and it
 * clears itself when the tab closes. Every read and write is wrapped: a
 * browser in private mode, or with site data blocked, throws on access rather
 * than returning null, and a marketing prompt is not worth an exception.
 */

const SEEN_KEY = "lh:consult-popup-seen";

/**
 * How long someone reads before being asked anything, in milliseconds.
 *
 * Long enough that they have arrived, looked at something and formed a view.
 * Under two seconds lands while the hero is still playing and reads as a
 * pop-up rather than an offer — and this version takes the whole screen, so
 * arriving too early costs more than it used to.
 */
const DELAY_MS = 8000;

/** Matches the closing animation below; the dialog is unmounted after it. */
const EXIT_MS = 320;

/** The picture in the left panel. Swap the file, not the markup. */
const ART = "/universities/hero.jpg";

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
    /* Storage is blocked; it just shows once per page load instead. */
  }
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const POINTS = [
  "A counsellor who has placed students where you want to go",
  "An honest read on your profile, budget and timeline",
  "A shortlist of courses to start from",
];

/** Everything inside the dialog that a Tab can land on. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ConsultPopup() {
  /* "in" and "out" are the two halves of the fade; only "out" is the reason
     this is not a plain boolean, since the dialog has to finish leaving
     before it is taken out of the page. */
  const [state, setState] = useState<"hidden" | "in" | "out">("hidden");
  const [artBroken, setArtBroken] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  /* Where focus was before this took it, so it can be handed back. */
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    setState((s) => (s === "in" ? "out" : s));
  }, []);

  useEffect(() => {
    if (seenThisSession()) return;
    const t = window.setTimeout(() => {
      markSeen();
      setState("in");
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (state !== "out") return;
    const t = window.setTimeout(() => setState("hidden"), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [state]);

  /* ---- the page underneath stops moving ----
     On the ROOT element, not on body: html is the scrolling element here, and
     `overflow: hidden` on body alone leaves the viewport perfectly scrollable
     in every browser that matters. The scrollbar's width is handed back as
     padding, or the whole page jumps sideways the moment it is hidden.

     Held through "out" as well as "in", so the page does not lurch back into
     motion underneath a dialog that is still fading. */
  useEffect(() => {
    if (state === "hidden") return;
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPad = root.style.paddingRight;
    root.style.overflow = "hidden";
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPad;
    };
  }, [state]);

  /* ---- focus belongs in here while it is open ---- */
  useEffect(() => {
    if (state !== "in") return;
    opener.current = document.activeElement;
    /* The dialog itself rather than the first control: landing on the close
       button reads as "we suggest you leave", and landing on the call to
       action is the pushy version of the same mistake. */
    box.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const stops = box.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      /* Wrap at both ends. Without this, Tab walks straight out of the
         dialog and into a page the reader cannot see or click. */
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (document.activeElement === first || document.activeElement === box.current)) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      /* Only meaningful if it is still on the page somewhere. */
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, [state, close]);

  if (state === "hidden") return null;

  return (
    /* The backdrop is the click target for "dismiss", which is why the box
       below stops propagation: a click that started inside the dialog must
       not close it, and a drag that ends outside it must not either. */
    <div className="cpop-veil" data-state={state} onMouseDown={close} role="presentation">
      <div
        className="cpop"
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cpop-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Decoration. It says nothing the right-hand panel does not, so a
            screen reader should walk straight past it to the offer. */}
        <div className="cpop-art" aria-hidden="true">
          {artBroken ? null : (
            <img src={ART} alt="" onError={() => setArtBroken(true)} />
          )}
        </div>

        <div className="cpop-body">
          <button className="cpop-close" type="button" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <p className="cpop-eyebrow">Free · 30 minutes · no obligation</p>
          <h2 className="cpop-title" id="cpop-title">
            Talk to a counsellor before you apply
          </h2>
          <ul className="cpop-points">
            {POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <div className="cpop-actions">
            <Link className="cpop-btn" to="/contact" onClick={close}>
              Book a free session <Arrow />
            </Link>
            <a
              className="cpop-btn cpop-btn-quiet"
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              Message us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
