import { type CSSProperties } from "react";

/**
 * A line of figures gliding right to left, forever.
 *
 * The home page's strip and the "who we are" band are the same object with
 * different numbers in it, which is why this takes its content as a prop
 * rather than owning any. Each page keeps its own figures; neither page owns
 * the design.
 *
 * HOW THE LOOP IS SEAMLESS. The list is rendered TWICE into one track, and
 * the track slides left by exactly half its own width before snapping back.
 * At the moment it snaps, the second copy is sitting precisely where the
 * first one started, so the jump is invisible.
 *
 * Both copies are wrapped the same way so the track has exactly two children
 * of exactly equal width — which is the whole reason `translateX(-50%)`
 * lands the second copy where the first began. Rendering the first copy's
 * items loose in the track and only wrapping the second would leave the two
 * halves subtly unequal and the loop would visibly jump.
 *
 * The duplicate is `aria-hidden`: it is there to make the arithmetic work,
 * not to be read out. A screen reader gets each figure once.
 */

export interface StatItem {
  /** The big number. Pre-formatted — some carry a comma, some a plus. */
  figure: string;
  /** The small line beside it, over the orange rule. */
  label: string;
  /** The line under the rule: named examples, not another statistic. */
  detail: string;
}

/**
 * Seconds one stat takes to cross the window.
 *
 * The duration of the whole loop is this times the number of stats, so the
 * SPEED stays put when a stat is added — a longer list simply takes longer
 * to come round again. A flat duration would have made every new stat speed
 * the whole line up.
 */
const SECONDS_PER_STAT = 7;

/** One stat: the figure, then the label, its rule and its examples. */
function StatCell({ stat }: { stat: StatItem }) {
  return (
    <div className="smq-stat">
      <span className="smq-figure">{stat.figure}</span>
      <span className="smq-meta">
        <span className="smq-label">{stat.label}</span>
        {/* The orange rule is decoration, not a separator anything reads. */}
        <span className="smq-rule" aria-hidden="true" />
        <span className="smq-detail">{stat.detail}</span>
      </span>
    </div>
  );
}

export default function StatMarquee({ items }: { items: StatItem[] }) {
  if (items.length === 0) return null;

  return (
    /* Full width, not inside .container: the line is supposed to run off both
       edges of the screen. The window clips it; the page cannot scroll
       sideways because of it. */
    <div
      className="smq"
      style={
        { "--smq-dur": `${items.length * SECONDS_PER_STAT}s` } as CSSProperties
      }
    >
      <div className="smq-track">
        <div className="smq-copy">
          {items.map((s) => (
            <StatCell key={s.label} stat={s} />
          ))}
        </div>
        <div className="smq-copy" aria-hidden="true">
          {items.map((s) => (
            <StatCell key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
