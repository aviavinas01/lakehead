import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { contact } from "../config/contact";

/**
 * The free-counselling prompt: a panel that slides in from the left at the
 * foot of the window once someone has been reading for a while, and slides
 * back out the way it came when it is dismissed.
 *
 * IT IS NOT A DIALOG ANY MORE, and that is the point. It used to be a modal
 * over a blurred page — which stops the visitor, demands an answer, and
 * arrives before they have seen anything worth being asked about. This asks
 * from the corner and lets them carry on: the page behind it stays scrollable
 * and fully interactive, nothing is blurred, focus is not taken, and there is
 * no backdrop to click through.
 *
 * Because it takes no focus, it must be reachable without it: it sits at the
 * end of the page's markup, so a keyboard finds it by tabbing, and Escape
 * closes it from anywhere.
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
 * The old value was under two seconds, which lands while the hero is still
 * playing and reads as a pop-up rather than an offer.
 */
const DELAY_MS = 8000;

/** Matches the closing transition below; the panel is unmounted after it. */
const EXIT_MS = 420;

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

export default function ConsultPopup() {
  /* "in" and "out" are the two halves of the slide; only "out" is the reason
     this is not a plain boolean, since the panel has to finish leaving before
     it is taken out of the page. */
  const [state, setState] = useState<"hidden" | "in" | "out">("hidden");

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

  /* Escape closes it from wherever the visitor happens to be. No scroll lock
     and no focus trap: it is not modal, and doing either to a panel that
     arrived uninvited would be worse than the panel itself. */
  useEffect(() => {
    if (state !== "in") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, close]);

  if (state === "hidden") return null;

  return (
    <aside
      className="cpop"
      data-state={state}
      aria-labelledby="cpop-title"
    >
      <button className="cpop-close" type="button" onClick={close} aria-label="Close">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
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
          WhatsApp
        </a>
      </div>
    </aside>
  );
}
