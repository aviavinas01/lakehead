import { useState, type CSSProperties } from "react";
import { OrbitItems } from "./HeroOrbit";

/**
 * The flags-and-planes circle, with a photograph inside it.
 *
 * ------------------------------------------------------------------
 * CURRENTLY NOT ON ANY PAGE. It closed the journey section on the home page
 * (the fifth panel of NextSteps) until the circle went back into the hero.
 * That panel is deliberately blank for now; this is kept, working, so
 * putting the circle back there is one line rather than a rebuild.
 * ------------------------------------------------------------------
 *
 * WHY THIS IS NOT `HeroOrbit`. The hero's ring holds whatever Home puts in
 * its disc — a film, a photograph, a placeholder — and is sized for the
 * hero. This one owns its own picture and is sized to sit in a pinned stage
 * one viewport tall.
 *
 * The BADGES are shared — see OrbitItems in HeroOrbit — so the two rings
 * cannot drift apart: the same flags, at the same angles, linking to the
 * same guides, with the same accessibility. It is only the layout around
 * them that differs, which is exactly the split that makes sharing
 * worthwhile.
 *
 * Wherever this is mounted inside something that scrolls into view, that
 * container must set `inert` while it is off screen (NextSteps did, with
 * inertWhenHidden), or the flag links are reachable by keyboard before the
 * circle is visible.
 */

/** Swap this for the real photograph when there is one. */
const DEFAULT_IMAGE = "/about/counselling.jpg";

export default function OrbitMark({
  image = DEFAULT_IMAGE,
  /** Seconds for one revolution. Slow enough to be atmosphere, not motion. */
  duration = 55,
}: {
  image?: string;
  duration?: number;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <div
      className="omk"
      style={{ "--orbit-duration": `${duration}s` } as CSSProperties}
    >
      <div className="omk-ring" aria-hidden="true" />

      {/* Its own tinted disc underneath, so a missing or slow file leaves a
          deliberate circle rather than a hole in the middle of the ring. */}
      <div className="omk-photo" aria-hidden="true">
        {missing ? null : (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setMissing(true)}
          />
        )}
      </div>

      <div className="omk-spin">
        <OrbitItems />
      </div>
    </div>
  );
}
