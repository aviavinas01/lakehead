import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import ConsultCard from "./ConsultCard";
import { JOURNEY, JOURNEY_CLOSER, type JourneyStep } from "../data/journey";

/**
 * "Your Journey to Global Education Starts Here" — the pinned band on the
 * home page.
 *
 * HOW IT READS. The band holds still while the page scrolls through it. The
 * left column names the step you are on; the right is a stack of
 * photographs, and each new step's photograph rises up and covers the one
 * before it completely. After the last step the stack is covered one final
 * time by the free-consultation form, which is what the whole sequence has
 * been walking towards.
 *
 * ------------------------------------------------------------------
 * WHY THIS WAS REWRITTEN — the old version jumped from step 1 to step 4.
 *
 * It ran TWO different pinning mechanisms and picked between them with a
 * media query duplicated in two places: `PIN_QUERY` in the component and a
 * matching pair of `@media` blocks in the stylesheet. The wide path pinned
 * the whole band and measured the section; the narrow path pinned an inner
 * frame and measured a spacer.
 *
 * The gate was `(min-width: 861px) and (min-height: 780px)`, and the height
 * half of that is the problem: a 768px-tall laptop screen, or any window
 * with a bookmarks bar on a 900px display, falls under 780px while still
 * being plainly a wide desktop. Those windows took the narrow path — whose
 * scroll room comes from `.next-steps-room`, a box that the WIDE stylesheet
 * rules leave `display: none`. With no room to travel, `travel` collapsed
 * toward zero, and the first flick of the wheel drove progress straight past
 * 1. Hence step 1, then step 4.
 *
 * So there is one mechanism now, not two. One sticky stage, one measurement,
 * and the scroll room is generated from the data's own length rather than
 * from a CSS box that another breakpoint might hide. Below the breakpoint
 * the pinning is dropped entirely for a plain stacked list — not a second
 * pin to keep in sync, just no pin at all. A layout that cannot be measured
 * cannot be measured wrong.
 * ------------------------------------------------------------------
 */

/** Panels: one per step, plus the consultation form at the end. */
const PANEL_COUNT = JOURNEY.length + 1;

/**
 * The left column's blocks, in order — the four steps and then the closing
 * line that goes with the form. One array so the column can render all of
 * them at once and slide between them; see the note on `.nsx-steps` below.
 */
const BLOCKS = [...JOURNEY, JOURNEY_CLOSER];

/**
 * How much scroll each panel gets, relative to the others.
 *
 * The form is given more than a step because it is the one panel with
 * something to do on it — a step is read in a moment, a form is filled in.
 * At equal weights the band released almost as soon as the form appeared.
 */
const WEIGHTS = [...JOURNEY.map(() => 1), 1.8];
const TOTAL_WEIGHT = WEIGHTS.reduce((a, b) => a + b, 0);

/** Scroll distance one unit of weight is worth, as a share of the viewport. */
const VH_PER_UNIT = 0.6;

/** Cumulative fractions of the way through: [0.2, 0.4, …, 1]. */
const THRESHOLDS = WEIGHTS.reduce<number[]>((acc, w) => {
  acc.push((acc[acc.length - 1] ?? 0) + w / TOTAL_WEIGHT);
  return acc;
}, []);

function panelFor(progress: number): number {
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (progress < THRESHOLDS[i]) return i;
  }
  return PANEL_COUNT - 1;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Takes a covered panel out of the page entirely — not focusable, not read
 * out, not clickable.
 *
 * `aria-hidden` alone is not enough and is actively wrong here: it hides a
 * panel from a screen reader while leaving its link (or, on the last panel,
 * six form fields) in the tab order, so a keyboard user tabs into controls
 * nobody can see. `inert` is the attribute that does both. React 18 has no
 * typing for it, hence the cast; it is a plain HTML attribute and every
 * browser we support honours it.
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
 * One photograph in the stack.
 *
 * `revealed` and `current` are deliberately two things. A panel that has
 * had its turn STAYS revealed — it is simply covered by the ones above it,
 * which is what makes each new photograph hide the last completely, and what
 * makes scrolling back up reverse exactly. But only the panel on top is
 * `current`, and only that one is reachable: without the distinction, tabbing
 * through the section would land on four links stacked invisibly behind each
 * other.
 *
 * A missing image file leaves the panel as its own colour field carrying
 * the same words — not a broken image and not a grey box. The photographs
 * can be dropped in at any point without touching this.
 */
function JourneyPanel({
  step,
  index,
  revealed,
  current,
}: {
  step: JourneyStep;
  index: number;
  revealed: boolean;
  current: boolean;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <Link
      className="jp"
      to={step.to}
      data-on={revealed || undefined}
      style={{ "--jp-color": step.color, zIndex: index + 1 } as CSSProperties}
      {...inertWhenHidden(current)}
    >
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
      <span className="jp-scrim" aria-hidden="true" />
      <span className="jp-body">
        <span className="jp-kicker">Step {String(index + 1).padStart(2, "0")}</span>
        <strong className="jp-title">{step.title}</strong>
        <span className="jp-caption">{step.caption}</span>
        <span className="jp-link">
          {step.linkLabel} <Arrow />
        </span>
      </span>
    </Link>
  );
}

export default function NextSteps() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState(0);

  /**
   * Which panel is showing is a pure function of how far the page has
   * scrolled through the section. One formula, one code path, and every
   * degenerate case resolves to panel 0 rather than to the end — the old
   * version's failure was that a collapsed measurement read as "finished".
   *
   * Reads happen on an animation frame and write through `setPanel`, which
   * React skips when the value has not changed — so a burst of scroll events
   * measures once and re-renders only on an actual panel change.
   */
  useEffect(() => {
    const el = section.current;
    if (!el) return;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const stageEl = stage.current;
      if (!stageEl) return;

      /* The stage is `display: none` below the pinning breakpoint, where
         the stacked list is shown instead. Measuring there would compute a
         progress for a layout that does not use one — and worse, would
         churn `panel` on every scroll of a page that ignores it. */
      if (stageEl.offsetHeight === 0) return;

      const rect = el.getBoundingClientRect();
      const travel = rect.height - stageEl.offsetHeight;

      /* Not tall enough to scroll through — which is the case on a phone,
         where the stage is not pinned at all. Show the first panel and stop;
         the stacked layout below does not use this index. */
      if (travel <= 0) {
        setPanel(0);
        return;
      }

      const progress = clamp(-rect.top / travel, 0, 1);
      setPanel(panelFor(progress));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* The stage's height decides `travel`, and it changes when a photograph
       finally loads or the window is zoomed. Watching it is what keeps the
       measurement honest without re-running it on every frame. */
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

  const onCloser = panel >= JOURNEY.length;

  return (
    <section
      className="nsx"
      ref={section}
      style={
        {
          /* The scroll room, generated from the data rather than written
             down: change JOURNEY's length or WEIGHTS and this follows. */
          "--nsx-scroll": `${(TOTAL_WEIGHT * VH_PER_UNIT).toFixed(2)}`,
        } as CSSProperties
      }
    >
      <div className="nsx-stage" ref={stage}>
        {/* The mark. It is the logo PNG used as a mask rather than as an
            image, because the file is red and this has to be beige — a
            filter can flatten it to black or white but not to an arbitrary
            colour. Guarded, since an unsupported mask would leave a solid
            beige rectangle sitting over the section. First in the stage so it
            paints behind everything without needing a z-index to say so. */}
        <div className="nsx-mark" aria-hidden="true">
          <span />
        </div>

        {/* The stack sits OUTSIDE the container, pinned to the stage's own
            right edge, so the photographs run to the edge of the window
            rather than stopping at the container's gutter. The container
            below reserves exactly its width as padding, which is what keeps
            the copy clear of it without either one measuring the other. */}
        <div className="nsx-stack">
          {JOURNEY.map((s, i) => (
            <JourneyPanel
              key={s.id}
              step={s}
              index={i}
              revealed={panel >= i}
              current={panel === i}
            />
          ))}
          {/* The last panel. It carries the section's own ground rather than
              a card of its own: the form is meant to look as though the
              photographs cleared away and left it standing on the band. */}
          <div
            className="jp jp-consult"
            data-on={onCloser || undefined}
            style={{ zIndex: PANEL_COUNT } as CSSProperties}
            {...inertWhenHidden(onCloser)}
          >
            <ConsultCard />
          </div>
        </div>

        <div className="container nsx-inner">
          <div className="nsx-copy">
            <h2>
              Your Journey to Global Education{" "}
              <span className="h-accent">Starts Here</span>
            </h2>

            {/* EVERY block is mounted, stacked in one spot, and slides.
                The previous version keyed this on the active step so React
                re-mounted it — which meant the outgoing text vanished on the
                spot and the incoming one appeared from nowhere. Nothing
                actually moved between the two, which is the flicker.

                Mounted together they can pass each other instead: the one
                arriving rises into place from below while the one leaving
                keeps rising and fades out. Same direction, continuous, and
                it reverses correctly when you scroll back up. */}
            <div className="nsx-steps" aria-live="polite">
              {BLOCKS.map((b, i) => (
                <div
                  className="nsx-step"
                  key={b.title}
                  data-state={i === panel ? "on" : i < panel ? "past" : "next"}
                  style={{ "--jp-color": b.color } as CSSProperties}
                  {...inertWhenHidden(i === panel)}
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
          No pin, no measurement, no shared index: every step is simply
          there, in order, with its photograph. This is a separate block
          rather than the same markup restyled because the pinned version's
          whole structure — one stage, panels stacked on top of each other —
          has no sensible small-screen form. Only one of the two is ever
          displayed; the stylesheet decides which. */}
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
        <ConsultCard />
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
