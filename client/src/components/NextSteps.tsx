import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import OrbitMark from "./OrbitMark";
import { JOURNEY, JOURNEY_CLOSER, type JourneyStep } from "../data/journey";

/**
 * "Your Journey to Global Education Starts Here" — the pinned band on the
 * home page.
 *
 * HOW IT READS. The band holds still while the page scrolls through it. The
 * left column names the step you are on; the right is a column of
 * photographs. The two are locked together: a step's words and its picture
 * are at the same point in the same journey at every instant, so the next
 * step PEEKS in from below — words and photograph together, however far you
 * have scrolled — and slides on up as you keep going. After the last step
 * the consultation form comes up the same way, on the same track, with its
 * own closing line rising beside it.
 *
 * ------------------------------------------------------------------
 * IT IS SCROLL-LINKED NOW, NOT STEPPED. This used to hold an integer — which
 * panel is showing — and let CSS transition between whole steps. Scrolling
 * did not move anything; it crossed a threshold, and the threshold played an
 * animation. So nothing ever peeked: a step was either arriving under its
 * own steam or already there, and the wheel had no purchase on it.
 *
 * Now there is one number, `--nsx-pos`, and it is a FRACTION: 2.5 means
 * halfway between the third step and the fourth, with both half in frame.
 * Stop scrolling anywhere and it stops there. Everything in the band —
 * the reel, every line of copy, the form, the fade on the heading — is
 * calculated from that one property in the stylesheet, so this component
 * writes exactly one value per frame and nothing else. No per-element style
 * thrash, and no way for the two columns to disagree about where they are.
 * ------------------------------------------------------------------
 *
 * WHAT IS STILL DISCRETE, and why. `active` — the rounded position — drives
 * only the things that must not change sixty times a second: which card is
 * emphasised, which panel is `inert`, what takes a click. Those are states,
 * not positions, and flipping them per frame would be both wasteful and
 * wrong.
 */

/** The closing panel after the last step — the orbiting mark. */
const CONSULT = JOURNEY.length;
/** Panels: one per step, plus the form. */
const PANEL_COUNT = JOURNEY.length + 1;

/**
 * The left column's blocks, in order — the four steps and then the closing
 * line that belongs to the form.
 */
const BLOCKS = [...JOURNEY, JOURNEY_CLOSER];

/**
 * Viewport heights of scroll it takes to travel from one panel to the next.
 *
 * THIS IS THE WEIGHT OF THE WHOLE BAND. Higher is calmer and longer to get
 * through; lower and a flick crosses two steps before the eye has settled on
 * either. It is a straight ratio now — one panel of travel per this much
 * scroll, all the way down — where the old version gave different steps
 * different shares. Uneven shares made sense when scrolling only tripped
 * thresholds; on a reel that moves WITH the wheel they would read as the
 * column mysteriously speeding up and slowing down.
 */
const VH_PER_PANEL = 0.55;

/**
 * Viewport heights held at the end, with the last panel landed and nothing
 * moving.
 *
 * CUT FROM 0.85 WHEN THE FORM BECAME A CIRCLE. This was long because the
 * last panel used to be the consultation form: releasing the band the moment
 * it arrived slid the form away under the hands of anyone who had started
 * filling it in, so it was pinned for most of a screen while they typed.
 *
 * The panel is now the orbiting mark, which is decoration — there is nothing
 * to fill in and nothing to be interrupted. Held that long it just read as
 * the page refusing to move: most of a screen of scrolling that changed
 * nothing on it. What is left is enough for the circle to land and be seen
 * to have landed before the section lets go.
 *
 * If a form ever returns to the last panel, this has to go back up with it.
 */
const HOLD_VH = 0.25;

/** Total scroll room the section reserves, in viewport heights. */
const SCROLL_VH = (PANEL_COUNT - 1) * VH_PER_PANEL + HOLD_VH;

/** The share of that spent moving; the rest is the hold. */
const MOVE_SHARE = ((PANEL_COUNT - 1) * VH_PER_PANEL) / SCROLL_VH;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Takes a covered panel out of the page entirely — not focusable, not read
 * out, not clickable.
 *
 * `aria-hidden` alone is not enough and is actively wrong here: it hides a
 * panel from a screen reader while leaving its link (or, on the form, six
 * fields) in the tab order, so a keyboard user tabs into controls nobody can
 * see. `inert` is the attribute that does both. React 18 has no typing for
 * it, hence the cast; it is a plain HTML attribute and every browser we
 * support honours it.
 */
const inertWhenHidden = (shown: boolean) =>
  (shown ? {} : { inert: "" }) as Record<string, string>;

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Where a panel sits relative to the one in play: 0 is in frame, negative
 * has been and gone, positive is still to come.
 */
function slotFor(offset: number): "past" | "on" | "next" {
  if (offset === 0) return "on";
  return offset < 0 ? "past" : "next";
}

/**
 * One photograph in the column.
 *
 * The card does not place itself — the reel moves all of them together,
 * which is what makes the queue read as a queue. `data-slot` carries
 * EMPHASIS only: the card in play is a touch larger and steps out of the
 * column, and it is the only one that takes a click. That is deliberately
 * still a stepped state with a transition of its own, riding on top of the
 * continuous travel: the column glides with your wheel, and the card that
 * arrives blooms into place a beat behind it.
 *
 * A missing image file leaves the card as its own colour field carrying the
 * same words — not a broken image and not a grey box.
 */
function JourneyPanel({
  step,
  index,
  offset,
}: {
  step: JourneyStep;
  index: number;
  /** index - the panel in play. See slotFor. */
  offset: number;
}) {
  const [missing, setMissing] = useState(false);
  const slot = slotFor(offset);

  return (
    <div
      className="jp"
      data-slot={slot}
      style={{ "--jp-color": step.color } as CSSProperties}
      {...inertWhenHidden(slot === "on")}
    >
      <Link className="jp-frame" to={step.to}>
        <span className="jp-shot">
          {missing ? (
            <span className="jp-blank" aria-hidden="true" />
          ) : (
            <img
              src={step.image}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              onError={() => setMissing(true)}
            />
          )}
        </span>

        <span className="jp-foot">
          <span className="jp-caption">{step.caption}</span>
          <span className="jp-link">
            {step.linkLabel} <Arrow />
          </span>
        </span>
      </Link>
    </div>
  );
}

export default function NextSteps() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /**
   * Turns how far the page has scrolled through the section into the band's
   * position, and writes it.
   *
   * The write is a single custom property on the stage. Everything visible
   * is calculated from it in the stylesheet — see the .nsx rules — so a
   * frame of scrolling costs one property set, not a pass over a dozen
   * elements. `active` goes through React and therefore only re-renders when
   * the rounded position actually changes.
   */
  useEffect(() => {
    const el = section.current;
    if (!el) return;

    let raf = 0;
    let lastActive = -1;

    const measure = () => {
      raf = 0;
      const stageEl = stage.current;
      if (!stageEl) return;

      /* The stage is `display: none` below the pinning breakpoint, where the
         stacked list is shown instead. Measuring there would compute a
         position for a layout that does not use one. */
      if (stageEl.offsetHeight === 0) return;

      const rect = el.getBoundingClientRect();
      const travel = rect.height - stageEl.offsetHeight;

      /* Not tall enough to scroll through. Park at the start; the stacked
         layout below does not read this. */
      const progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;

      /* The hold at the end is what MOVE_SHARE buys: past that share of the
         section, `pos` is already at its maximum and stays there while the
         rest of the scroll goes by with the last panel standing still. */
      const pos = clamp(progress / MOVE_SHARE, 0, 1) * (PANEL_COUNT - 1);

      stageEl.style.setProperty("--nsx-pos", pos.toFixed(4));

      const next = Math.round(pos);
      if (next !== lastActive) {
        lastActive = next;
        setActive(next);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* The stage's height decides `travel`, and it changes when a photograph
       finally loads or the window is zoomed. Watching it is what keeps the
       measurement honest without re-running it every frame. */
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    ro.observe(stage.current!);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onCloser = active >= CONSULT;

  return (
    <section
      className="nsx"
      ref={section}
      style={
        {
          /* The scroll room, generated from the panel count and the two
             constants above rather than written down: add a step to JOURNEY
             and this follows. */
          "--nsx-scroll": SCROLL_VH.toFixed(2),
        } as CSSProperties
      }
    >
      <div className="nsx-stage" ref={stage}>
        {/* The reel sits OUTSIDE the container, pinned to the stage's own
            right edge, so it takes the right-hand side of the window rather
            than stopping at the container's gutter. The container below
            reserves exactly its width as padding, which is what keeps the
            copy clear of it without either one measuring the other. */}
        <div className="nsx-stack">
          <div className="nsx-reel">
            {JOURNEY.map((s, i) => (
              <JourneyPanel key={s.id} step={s} index={i} offset={i - active} />
            ))}
          </div>

          {/* NOT a card in the queue, but travelling on the same track and
              off the same number — so it rises from below and peeks exactly
              as a card does, and its closing line in the left column rises
              with it.

              It is a panel rather than a reel item because it has to be
              taller and wider than a photograph: six fields and a button do
              not fit a card sized to sit half a stage high, and shrinking
              the form to fit the queue would have been the queue deciding
              how usable the form is. Opaque, so it covers the cards as it
              comes up over them. */}
          <div
            className="nsx-consult"
            style={{ "--i": CONSULT } as CSSProperties}
            data-on={onCloser || undefined}
            {...inertWhenHidden(onCloser)}
          >
            <OrbitMark />
          </div>
        </div>

        <div className="container nsx-inner">
          {/* `data-started` is the one thing here that stays a threshold:
              an invisible heading must stop taking clicks, and "taking
              clicks" has no half-way value to interpolate. Everything
              about where it SITS comes off --nsx-pos instead. */}
          <div className="nsx-copy" data-started={active >= 1 || undefined}>
            <h2>
              Your Journey to Global Education{" "}
              <span className="h-accent">Starts Here</span>
            </h2>

            {/* EVERY block is mounted and stacked in one spot, and each one
                is placed by its own distance from --nsx-pos. So the column
                is a reel too, running off the same number as the
                photographs: block 2 is exactly as far up as photograph 2 is,
                at every instant and at every scroll speed. There is nothing
                to keep in step because there is only one thing to be in step
                with. */}
            <div className="nsx-steps" aria-live="polite">
              {BLOCKS.map((b, i) => (
                <div
                  className="nsx-step"
                  key={b.title}
                  style={{ "--i": i, "--jp-color": b.color } as CSSProperties}
                  {...inertWhenHidden(i === active)}
                >
                  <span className="nsx-step-n" aria-hidden="true">
                    {i < JOURNEY.length ? String(i + 1).padStart(2, "0") : "→"}
                  </span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- the phone layout ----
          No pin, no measurement, no shared position: every step is simply
          there, in order, with its photograph. This is separate markup
          rather than the same markup restyled because the pinned version's
          whole structure has no sensible small-screen form. Only one of the
          two is ever displayed; the stylesheet decides which. */}
      <div className="container nsx-list">
        <h2>
          Your Journey to Global Education{" "}
          <span className="h-accent">Starts Here</span>
        </h2>
        {JOURNEY.map((s, i) => (
          <article
            className="nsx-list-item"
            key={s.id}
            style={{ "--jp-color": s.color } as CSSProperties}
          >
            <Link className="nsx-list-shot" to={s.to}>
              <JourneyListImage step={s} />
              <span className="jp-scrim" aria-hidden="true" />
              <span className="jp-kicker">Step {String(i + 1).padStart(2, "0")}</span>
            </Link>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <Link className="nsx-list-link" to={s.to}>
              {s.linkLabel} <Arrow />
            </Link>
          </article>
        ))}
        <OrbitMark />
      </div>
    </section>
  );
}

/** Same graceful-degradation rule as the panel, for the stacked layout. */
function JourneyListImage({ step }: { step: JourneyStep }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <span className="jp-blank" aria-hidden="true" />;
  return (
    <img
      src={step.image}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setMissing(true)}
    />
  );
}
