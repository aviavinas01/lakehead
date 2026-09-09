import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  COUNTRY_PATHS,
  EU_RING_R,
  MAP_H,
  MAP_W,
  STOPS,
  euStarsPath,
  project,
} from "../data/worldMap";

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
 * THE MAP IS IN TWO PIECES, and the split is the whole design:
 *
 *   · The 169 countries nobody is being sold live in public/world-map.svg
 *     as ONE flat path, loaded as an ordinary <img>. It is 94kB of
 *     coordinates that never change and never need styling, so it belongs
 *     in the browser's image cache rather than in the JavaScript bundle,
 *     where it would be parsed on every visit to every page.
 *   · The eight destinations live inline, because they have to be styled
 *     and lit up one at a time, and you cannot reach inside an <img>.
 *
 * The two register exactly because they share a viewBox AND a box with that
 * viewBox's aspect ratio — see .journey-map-box. Give the box any other
 * proportion and the outlines drift off the countries underneath them,
 * which is the one way this can fail and the one thing to check if it does.
 *
 * THE POINTER TRAVELS rather than eight dots blinking at once. Only one
 * place is ever being pointed at, which is what a journey is; the other
 * seven are still legible because being highlighted is a fill and an
 * outline, not the pointer. It glides between stops rather than cutting,
 * so the band reads as a route being traced instead of a slideshow.
 *
 * Under prefers-reduced-motion none of that happens: every stop gets a
 * plain static dot and the timer never starts. That is deliberately not
 * "the same thing, slower" — someone who has asked for less movement still
 * needs to see which eight countries this band is about, and eight quiet
 * dots say it without anything moving at all.
 * ------------------------------------------------------------------
 */

/** How long the pointer rests on a country before moving to the next. */
const DWELL_MS = 2400;

export default function ConsultBanner() {
  /* -1 means "not travelling": the reduced-motion path, where every stop is
     marked and none is singled out. It is the initial value too, so the
     first paint is the static map and the journey starts a beat later —
     which also keeps the very first glide from being the one that competes
     with the page still settling. */
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setActive(0);
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % STOPS.length),
      DWELL_MS
    );
    return () => window.clearInterval(id);
  }, []);

  const travelling = active >= 0;
  const [euX, euY] = project(
    STOPS.find((s) => s.eu)!.lon,
    STOPS.find((s) => s.eu)!.lat
  );
  const [px, py] = travelling
    ? project(STOPS[active].lon, STOPS[active].lat)
    : [0, 0];

  return (
    <section className="journey-cta">
      {/* Decorative: the eight countries are named in the copy people
          actually read, on /study-abroad and in the footer. A screen reader
          being handed 169 outlines and a moving dot gains nothing. */}
      <div className="journey-map" aria-hidden="true">
        <div className="journey-map-box">
          <img
            className="journey-map-base"
            src="/world-map.svg"
            alt=""
            loading="lazy"
            decoding="async"
          />
          {/* The wash sits BETWEEN the backdrop and the eight, not over the
              lot. Over the lot, the countries this band exists to point at
              were the palest thing on it: the scrim is at its strongest
              across the middle, which is exactly where America, Britain and
              Europe are. Here it mutes the 169 and the eight stay crisp. */}
          <div className="journey-map-scrim" />
          <svg
            className="journey-map-live"
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {STOPS.map((s) =>
              s.country ? (
                <path
                  key={s.id}
                  className={`jm-c${travelling && STOPS[active].id === s.id ? " is-on" : ""}`}
                  d={COUNTRY_PATHS[s.country]}
                />
              ) : null
            )}

            {/* The European emblem, drawn rather than outlined — see the
                note on the EU stop in data/worldMap.ts. */}
            <g className={`jm-eu${travelling && STOPS[active].eu ? " is-on" : ""}`}>
              <circle className="jm-eu-disc" cx={euX} cy={euY} r={EU_RING_R} />
              <path className="jm-eu-stars" d={euStarsPath(euX, euY)} />
            </g>

            {travelling ? (
              <g
                className="jm-pointer"
                style={{ transform: `translate(${px}px, ${py}px)` }}
              >
                {/* Two rings on the same animation half a cycle apart, so
                    there is always one expanding and the pulse reads as
                    continuous rather than as a repeated blink. */}
                <circle className="jm-ping" r="5" />
                <circle className="jm-ping jm-ping-late" r="5" />
                <circle className="jm-dot" r="3.1" />
              </g>
            ) : (
              STOPS.map((s) => {
                const [x, y] = project(s.lon, s.lat);
                return <circle key={s.id} className="jm-dot jm-dot-still" cx={x} cy={y} r="3.1" />;
              })
            )}
          </svg>
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
