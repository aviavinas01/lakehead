import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Shot } from "../shared/destinationBits";

/**
 * The "types of university" sequence, as a stack that deals itself.
 *
 * WHAT IT DOES. The section holds still while the page scrolls through it.
 * Each type is one panel carrying its photograph AND its text together, so
 * the two always arrive in the same moment rather than the picture appearing
 * and the words catching up. The next panel slides up over the one before
 * and covers it completely; scrolling back reverses it exactly.
 *
 * WHY IT REPLACED A LIST. These were a column of four or five rows, each an
 * image beside a paragraph. Read straight through, every row looked like the
 * one above it, and the section — often the longest on a guide — turned into
 * the wall the rest of the page works to avoid. A stack gives each type the
 * whole frame for as long as you are on it.
 *
 * NOTHING IS LOST. Every field the list rendered still renders: the name,
 * the lead line, the body, "Best for", and the folded list of examples. The
 * text column scrolls inside its own panel if a particular type runs long,
 * which is the one thing a fixed-height frame has to allow for.
 *
 * BELOW THE BREAKPOINT there is no pinning at all — just the plain list,
 * photograph above text. That is a deliberate second layout rather than the
 * same one restyled: a stack of absolutely-positioned panels has no sensible
 * form on a phone, and a pinned sequence on a touch screen fights the
 * scroll. Only one of the two is ever displayed; the stylesheet decides.
 */

export interface TypeItem {
  name: string;
  lead: string;
  text: string;
  best?: string;
  examples?: string[];
  image: string;
}

/** Viewport heights of scroll each panel gets before the next takes over. */
const DWELL_VH = 0.72;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function Panel({ item, index, count }: { item: TypeItem; index: number; count: number }) {
  return (
    <>
      {/* `still`: these already run their own slow scale (tst-drift), and a
          CSS animation on `transform` overrides the element's own transform
          outright — the parallax would be swallowed whole and the frame
          left showing its edges. One motion per picture. */}
      <figure className="tst-shot">
        <Shot src={item.image} alt="" still />
      </figure>
      <div className="tst-body">
        <p className="tst-count" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
          <span> / {String(count).padStart(2, "0")}</span>
        </p>
        <h3>{item.name}</h3>
        <p className="tst-lead">{item.lead}</p>
        <p className="tst-text">{item.text}</p>
        {item.best ? (
          <p className="tst-best">
            <strong>Best for:</strong> {item.best}
          </p>
        ) : null}
        {item.examples && item.examples.length > 0 ? (
          <details className="usa-examples">
            <summary>Examples you may recognise ({item.examples.length})</summary>
            <ul>
              {item.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </>
  );
}

export default function TypeStack({ items }: { items: TypeItem[] }) {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState(0);

  const count = items.length;

  /* Which panel is showing is a pure function of how far the page has
     scrolled through the section — one formula, and every degenerate case
     resolves to the FIRST panel rather than the last. A collapsed
     measurement reading as "finished" is how a sequence like this ends up
     skipping straight to its final item. */
  useEffect(() => {
    const el = section.current;
    if (!el || count === 0) return;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const stageEl = stage.current;
      if (!stageEl) return;

      /* The stage is display:none below the breakpoint, where the plain list
         is shown instead. Measuring there would churn state for a layout
         that does not read it. */
      if (stageEl.offsetHeight === 0) return;

      const rect = el.getBoundingClientRect();
      const travel = rect.height - stageEl.offsetHeight;
      if (travel <= 0) {
        setPanel(0);
        return;
      }

      const progress = clamp(-rect.top / travel, 0, 1);
      setPanel(Math.min(count - 1, Math.floor(progress * count)));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* The stage's height decides `travel`, and it changes when a photograph
       loads or the window is zoomed. */
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    ro.observe(stage.current!);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);

  if (count === 0) return null;

  return (
    <div
      className="tst"
      ref={section}
      style={{ "--tst-scroll": (count * DWELL_VH).toFixed(2) } as CSSProperties}
    >
      <div className="tst-stage" ref={stage}>
        <div className="tst-deck">
          {items.map((item, i) => (
            <article
              className="tst-panel"
              key={item.name}
              /* Shown once it is its turn, and it STAYS shown — later panels
                 simply cover it. That is what makes each one replace the
                 last, and what makes scrolling back up reverse cleanly. */
              data-on={panel >= i || undefined}
              style={{ zIndex: i + 1 } as CSSProperties}
              /* Only the panel on top is reachable. Without this, tabbing
                 through the section would land on the folded example lists
                 of every panel stacked invisibly behind it. */
              {...(panel === i ? {} : ({ inert: "" } as Record<string, string>))}
            >
              <Panel item={item} index={i} count={count} />
            </article>
          ))}
        </div>

        <ol className="tst-dots" aria-hidden="true">
          {items.map((item, i) => (
            <li key={item.name} data-on={panel === i || undefined} />
          ))}
        </ol>
      </div>

      {/* The small-screen layout: no pin, no measurement, everything present
          in order. */}
      <div className="tst-list">
        {items.map((item, i) => (
          <article className="tst-list-item" key={item.name}>
            <Panel item={item} index={i} count={count} />
          </article>
        ))}
      </div>
    </div>
  );
}
