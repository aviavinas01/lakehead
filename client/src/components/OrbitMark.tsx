import { useState, type CSSProperties } from "react";
import { ORBIT_ENTRIES, PlaneIcon } from "./HeroOrbit";

/**
 * The flags-and-planes circle, with a photograph inside it.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS NOT `HeroOrbit`. That component draws the same ring but its
 * middle is deliberately EMPTY: the hero's film is rendered by Home as a
 * child of the section, because it opens out to full width and an element
 * cannot escape its own containing block. `HeroOrbit` only marks where the
 * circle sits so Home can park the video on it, and it takes `open` and
 * `slotRef` to do that.
 *
 * None of that applies here. This one owns its own picture, has no opened
 * state and nothing to measure. Reusing the hero component would have meant
 * passing a ref nobody reads and a flag that is always false, then absolutely
 * positioning an image over a slot designed to stay empty.
 *
 * The BADGES are shared — see ORBIT_ENTRIES — so the two rings cannot drift
 * apart. It is the layout around them that differs, which is exactly the
 * split that makes sharing worthwhile.
 * ------------------------------------------------------------------
 *
 * Decorative throughout. The section it sits in already says what it means
 * in text, so a screen reader should walk past the whole thing.
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
      aria-hidden="true"
    >
      <div className="omk-ring" />

      {/* Its own tinted disc underneath, so a missing or slow file leaves a
          deliberate circle rather than a hole in the middle of the ring. */}
      <div className="omk-photo">
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
        {ORBIT_ENTRIES.map((e) =>
          e.kind === "flag" ? (
            <span
              key={e.angle}
              className="orbit-item"
              style={{ "--angle": `${e.angle}deg` } as CSSProperties}
            >
              <span className={`orbit-badge${e.small ? " orbit-badge-sm" : ""}`}>
                {e.node}
              </span>
            </span>
          ) : (
            <span
              key={e.angle}
              className="orbit-item orbit-plane"
              style={{ "--angle": `${e.angle}deg` } as CSSProperties}
            >
              <PlaneIcon />
            </span>
          )
        )}
      </div>
    </div>
  );
}
