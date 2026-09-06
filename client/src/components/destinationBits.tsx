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

export const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
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
export function Shot({
  src,
  alt,
  className,
  still,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Opts out of the drift for a photograph that already has motion of its
      own. A CSS animation on `transform` overrides the element's own
      transform outright, so the two cannot share an image: the drift would
      be silently swallowed and the frame left looking broken at the edges. */
  still?: boolean;
}) {
  const [missing, setMissing] = useState(false);

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
      if (still || !img || img.closest("a")) return;
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
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setMissing(true)}
    />
  );
}
