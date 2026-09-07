import { useCallback, useEffect, useRef, useState } from "react";
import { registerParallax } from "../lib/parallax";

/**
 * The small shared pieces every destination page uses — the three icons and
 * the photo wrapper. Only genuinely generic things belong here: the sections
 * themselves stay in each country's own page, because Australia's pathways
 * and Canada's study permit are not the same shape and pretending otherwise
 * is how these pages end up saying nothing.
 */

export const Check = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const Pin = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/**
 * The site's one arrow: long, thin, and drawn rather than typed.
 *
 * It used to be a stubby 16x16 chevron-on-a-stump. This is the same mark
 * stretched out — a long shaft with a small head — which is what lets it sit
 * at the end of a line of letter-spaced capitals and read as part of the
 * same rule rather than as an icon bolted on.
 *
 * ONE DEFINITION, EVERY PAGE. It is used in seventy-odd places across
 * twenty-three files, including the study-abroad pages: two arrow styles on
 * one site read as an oversight, not a decision, and the nav and footer are
 * shared anyway so the two would have ended up side by side.
 *
 * The thinner stroke is deliberate at this length — at the old weight of 2 a
 * shaft this long looks like a rule with a barb on it.
 */
export const Arrow = () => (
  <svg viewBox="0 0 34 12" width="34" height="12" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M0 6h31M25 1l6 5-6 5" />
  </svg>
);

/**
 * A photo that degrades to a plain tinted panel instead of a broken image,
 * and that drifts gently inside its frame as you scroll past it.
 *
 * The destination pages are laid out around their photography before the
 * photography exists, so a page referencing a file nobody has uploaded yet
 * still looks finished — drop the file into client/public at the same path
 * and it appears on its own, with no code change. Missing shots are hidden
 * from screen readers, since an empty panel has nothing to describe. A
 * missing shot does not drift either: there is nothing there to move.
 *
 * THE DRIFT OPTS ITSELF OUT OF CLICKABLE CARDS. Rather than a prop every
 * call site has to remember, the image asks whether it is inside a link and
 * stays still if it is — a photograph that moves under the cursor while
 * also being a button is two invitations at once, and the card already has
 * its own hover to do that job. Wrapping an existing Shot in a Link later
 * therefore does the right thing on its own, with nothing to update here.
 *
 * See lib/parallax for the engine, and for why it does not run on touch.
 */
/**
 * `fetchpriority`, spelled the way the DOM spells it.
 *
 * React 18 has no special handling for this attribute — it is not in its
 * property list, so the camelCase `fetchPriority` React would want draws an
 * "unrecognized prop" warning and never reaches the element. Spread in
 * lowercase it is passed straight through, which is all that was ever
 * needed. The cast is the same one `inert` takes elsewhere in this codebase,
 * and for the same reason: a real HTML attribute React has not typed yet.
 */
const eagerly = (on?: boolean) =>
  (on ? { fetchpriority: "high" } : {}) as Record<string, string>;

export function Shot({
  src,
  alt,
  className,
  still,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  /** For a photograph that is on screen before anything is scrolled — the
      hero of a page, and nothing else. It stops the browser deferring the
      request and asks for it ahead of the queue. See the note by `loading`
      below for why this is not simply the default. */
  priority?: boolean;
  /** Opts out of the drift for a photograph that already has motion of its
      own. A CSS animation on `transform` overrides the element's own
      transform outright, so the two cannot share an image: the drift would
      be silently swallowed and the frame left looking broken at the edges. */
  still?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  /* Drives the shimmer. Starts false and is set the moment the file paints —
     or immediately, from the ref below, if it was already in cache. */
  const [loaded, setLoaded] = useState(false);

  /* A ref callback rather than an effect: it fires with the node on mount
     and with null when the node goes, which is exactly the register /
     unregister pair — and it cannot run against a stale node the way an
     effect keyed on nothing can.

     THE NULL CALL MUST UNREGISTER, and an early return on it was a real
     leak: when a photograph 404s this component swaps the <img> for the
     tinted panel, so the node goes while the component stays mounted. The
     unmount cleanup below never fires in that case, and the detached image
     stayed in the engine's map and its observer — measured on every frame,
     for a picture no longer on the page. A page whose photography has not
     been uploaded yet is the normal state of this site, so that is not a
     rare path. */
  const undrift = useRef<() => void>(() => {});
  const drift = useCallback(
    (img: HTMLImageElement | null) => {
      undrift.current();
      undrift.current = () => {};
      if (!img) return;
      /* A CACHED IMAGE MAY HAVE FINISHED BEFORE REACT ATTACHED, in which
         case `onLoad` has already fired at nobody and would never fire
         again — the shimmer would sit under a picture that is fully there,
         for the life of the page. `complete` is how you ask after the fact. */
      if (img.complete && img.naturalWidth > 0) setLoaded(true);
      if (still || img.closest("a")) return;
      undrift.current = registerParallax(img);
    },
    [still]
  );
  useEffect(() => () => undrift.current(), []);

  if (missing) {
    return <div className={`dpage-shot-empty ${className ?? ""}`} aria-hidden="true" />;
  }
  return (
    <img
      ref={drift}
      /* The shimmer is a class on the IMAGE, not a wrapper round it. A dozen
         rules in the stylesheet select `.vg-shot img`, `.dpage-hero-bg img`
         and their like as direct children, and a wrapper would have quietly
         detached every one of them. An <img> with nothing decoded yet shows
         its own background, so the placeholder needs no element of its own. */
      className={`${className ?? ""}${loaded ? "" : " shot-load"}`.trim()}
      src={src}
      alt={alt}
      /* LAZY IS RIGHT FOR ALMOST EVERY PICTURE HERE and wrong for one: the
         hero. `loading="lazy"` tells the browser it may wait until layout
         settles before even requesting the file, which on the image somebody
         is already looking at is the difference between a page that arrives
         and a page that assembles. Heroes pass `priority`; everything below
         the fold stays lazy, which is what keeps a twenty-section guide from
         fetching thirty photographs at once. */
      loading={priority ? "eager" : "lazy"}
      {...eagerly(priority)}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setMissing(true)}
    />
  );
}
