import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { MonthBucket } from "../../lib/inquiryStats";

/**
 * Enquiries over time — an area chart you can actually interrogate.
 *
 * DRAWN BY HAND, and staying that way. A charting library is between forty
 * and a hundred and fifty kilobytes gzipped; this is one polyline, one filled
 * path and a few rules, for twelve numbers. The admin bundle would more than
 * double to save about sixty lines.
 *
 * IT IS OPERABLE WITHOUT A MOUSE. The plot takes focus and the arrow keys
 * walk it month by month, Home and End jump to the ends — because a tooltip
 * that only a pointer can reach means the exact figures are unavailable to
 * anybody using a keyboard, and the figures are the point of the chart. The
 * same `active` index drives the pointer and the keyboard, so there is one
 * behaviour rather than two that can disagree.
 *
 * THE HOVER TARGETS ARE FULL-HEIGHT COLUMNS, not the dots. A four-pixel
 * circle is a miserable thing to chase; the whole column above a month
 * selects it, which is what makes it feel responsive rather than fiddly.
 */

/* A fixed coordinate system that the SVG scales out of. Nothing here is in
   pixels on the page — the viewBox does the fitting, so the chart is sharp
   at any width without measuring anything. */
const W = 640;
const H = 200;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;

export default function InquiryChart({
  buckets,
  cumulative,
}: {
  buckets: MonthBucket[];
  /** Changes only the wording; the running total is computed by the caller. */
  cumulative: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  const geometry = useMemo(() => {
    /* The floor is always zero — starting the axis at the smallest value
       makes a flat run of months look like a mountain range, which is the
       oldest way to mislead with a chart. `|| 1` keeps an all-zero list from
       dividing by nothing rather than inventing a scale. */
    const peak = Math.max(1, ...buckets.map((b) => b.count));
    const plot = H - PAD_TOP - PAD_BOTTOM;
    const step = buckets.length > 1 ? (W - PAD_X * 2) / (buckets.length - 1) : 0;

    const points = buckets.map((b, i) => ({
      x: PAD_X + i * step,
      y: PAD_TOP + plot - (b.count / peak) * plot,
    }));

    const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    /* The fill is the same line closed along the baseline. Drawn as its own
       path rather than as a filled polyline so the stroke stays a stroke. */
    const area =
      points.length === 0
        ? ""
        : `M ${points[0].x.toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} ` +
          points.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
          ` L ${points[points.length - 1].x.toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} Z`;

    return { peak, points, line, area, step, plot };
  }, [buckets]);

  const total = buckets.reduce((a, b) => a + b.count, 0);
  const shown = active === null ? null : buckets[active];

  /* Which column the pointer is over, from its position across the plot.
     One handler on the whole surface rather than one per column: twelve
     listeners to answer a question one piece of arithmetic already answers. */
  const track = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    if (box.width === 0 || buckets.length === 0) return;
    const ratio = (e.clientX - box.left) / box.width;
    const i = Math.round(ratio * (buckets.length - 1));
    setActive(Math.min(buckets.length - 1, Math.max(0, i)));
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (buckets.length === 0) return;
    const at = active ?? buckets.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = Math.min(buckets.length - 1, at + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, at - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = buckets.length - 1;
    else if (e.key === "Escape") {
      setActive(null);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  };

  return (
    <div className="adm-plot">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="adm-plot-svg"
        preserveAspectRatio="none"
        role="img"
        tabIndex={0}
        aria-label={
          `Enquiries per month, ${cumulative ? "running total" : "each month"}: ` +
          buckets.map((b) => `${b.label} ${b.year}, ${b.count}`).join("; ")
        }
        onPointerMove={track}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        {/* Three rules: nothing, half, peak. Enough to read a height off,
            few enough not to become the loudest thing in the picture. */}
        {[0, 0.5, 1].map((f) => {
          const y = PAD_TOP + geometry.plot * (1 - f);
          return (
            <line
              key={f}
              className="adm-plot-rule"
              x1={0}
              x2={W}
              y1={y}
              y2={y}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        <path className="adm-plot-area" d={geometry.area} />
        <polyline
          className="adm-plot-line"
          points={geometry.line}
          vectorEffect="non-scaling-stroke"
        />

        {shown && geometry.points[active!] ? (
          <>
            <line
              className="adm-plot-guide"
              x1={geometry.points[active!].x}
              x2={geometry.points[active!].x}
              y1={PAD_TOP}
              y2={H - PAD_BOTTOM}
              vectorEffect="non-scaling-stroke"
            />
            {/* Two circles: a fat one in the page's background colour to
                punch a hole in the line, and the mark on top of it. */}
            <circle
              className="adm-plot-dot-hole"
              cx={geometry.points[active!].x}
              cy={geometry.points[active!].y}
              r={6}
            />
            <circle
              className="adm-plot-dot"
              cx={geometry.points[active!].x}
              cy={geometry.points[active!].y}
              r={3.5}
            />
          </>
        ) : null}
      </svg>

      {/* The month labels are HTML and not SVG text: preserveAspectRatio
          "none" stretches the drawing to the box, which would stretch any
          text inside it with the picture. */}
      <div className="adm-plot-axis" aria-hidden="true">
        {buckets.map((b, i) => (
          <span key={b.key} data-on={i === active || undefined}>
            {b.label}
          </span>
        ))}
      </div>

      {/* One readout under the chart rather than a floating tooltip: it never
          covers the line it describes, never runs off the edge, and holds a
          resting value when nothing is selected so the space does not jump. */}
      <p className="adm-plot-read" aria-live="polite">
        {shown ? (
          <>
            <strong>{shown.count.toLocaleString()}</strong>{" "}
            {cumulative ? "by the end of" : "in"} {shown.label} {shown.year}
          </>
        ) : (
          <>
            <strong>{total.toLocaleString()}</strong> across the period ·{" "}
            <span className="adm-quiet">
              hover, or focus the chart and use the arrow keys
            </span>
          </>
        )}
      </p>
    </div>
  );
}
