import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { registerParallax } from "../../lib/parallax";

/**
 * "Get Ready To Begin Your Journey" — the large call-to-action band above
 * the footer: a world map, centred copy and a single Contact Us link.
 *
 * The button goes to /contact. It used to open the free-consultation form in
 * an overlay, which was the wrong answer to "Contact Us" twice over: the
 * contact page carries all three offices, the map and the enquiry form,
 * none of which fitted in a dialog — and a band whose whole job is to send
 * people somewhere was instead keeping them here.
 *
 * ------------------------------------------------------------------
 * THE MAP IS TWO IMAGES AND NOTHING ELSE. No component state, no timer, no
 * geometry in the bundle — the whole drawing is two cached SVG files, and
 * this file just stacks them.
 *
 *   world-map.svg            every other country, a pale hairline
 *   world-map-highlight.svg  the destinations, drawn at full weight
 *
 * WHY TWO FILES rather than one: the wash goes between them. It has to mute
 * the backdrop without muting the countries the band exists to point at, and
 * it is strongest across the middle of the map — exactly where America,
 * Britain and Europe are. One image cannot be on both sides of it.
 *
 * They register exactly because they share a viewBox AND sit in a box with
 * that viewBox's aspect ratio — see .journey-map-box. Give the box any other
 * proportion and the two drawings drift apart. That is the one way this can
 * fail and the first thing to check if it ever looks wrong.
 *
 * BOUNDARIES, NOT TERRITORY. The highlighted countries are a heavier
 * outline and no fill at all. A tinted fill made them read as blocks of
 * colour sitting behind the headline, competing with it; the line alone
 * says the same thing and stays out of the way. The European Union is its
 * twenty-seven member states drawn the same way, rather than a badge — the
 * bloc is a shape, and a logo dropped on top of one says less than the
 * shape does.
 *
 * THE MAP DRIFTS AND BREATHES AS THE BAND CROSSES THE WINDOW; the headline
 * and the button do not. That split is why the two live in separate
 * elements: .journey-map carries the movement, .journey-inner is a sibling
 * of it and is never touched, so type that has to be read stays nailed down
 * while the scenery behind it moves.
 *
 * THE BOX IS REGISTERED, NOT THE IMAGES. The same engine every editorial
 * photograph on the site uses (lib/parallax), pointed at the wrapper rather
 * than at either <img>. Registering the two pictures separately would give
 * them two independently computed offsets and let the highlighted countries
 * slide off the backdrop underneath them; the scrim between them would stay
 * where it was. One transformed parent moves all three as one drawing.
 *
 * It needs no class of its own, and that is deliberate. The transform below
 * reads `--px-t` with a fallback of 0, so when the engine declines — touch,
 * a coarse pointer, prefers-reduced-motion — the property is simply never
 * written and the map sits perfectly still. Nothing to toggle, and none of
 * the className-wiping trouble documented in registerParallax.
 *
 * There is no pointer and no pulse on the map itself.
 *
 * Geometry is Natural Earth 1:50m, public domain, projected to
 * equirectangular once by a throwaway script and committed. There is no map
 * library in this project and no request at runtime beyond the two images.
 * ------------------------------------------------------------------
 */
export default function ConsultBanner() {
  const box = useRef<HTMLDivElement>(null);

  /* Registers on mount, unregisters on unmount. The engine returns null when
     it has declined, which is nothing to handle here — see above. */
  useEffect(() => registerParallax(box.current) ?? undefined, []);

  return (
    <section className="journey-cta">
      {/* Decorative. The destinations are named in the copy people actually
          read, on /study-abroad and in the footer; handing a screen reader
          two hundred outlines would add nothing. */}
      <div className="journey-map" aria-hidden="true">
        <div className="journey-map-box" ref={box}>
          <img
            className="journey-map-base"
            src="/world-map.svg"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="journey-map-scrim" />
          <img
            className="journey-map-pick"
            src="/world-map-highlight.svg"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="container journey-inner">
        <h2 className="journey-title">
          Get Ready To Begin{" "}
          <span className="h-outline">Your Journey</span>
        </h2>
        <Link className="journey-btn" to="/contact">
          Contact Us
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
