import { useEffect, useRef } from "react";
import { GLOBE_RINGS } from "./globeRings";

/**
 * An outlined globe that turns, can be dragged, and carries a pin on every
 * destination — clicking one selects that country.
 *
 * The projection is orthographic and written out longhand rather than pulled
 * from a mapping library: it is a dozen lines of trigonometry, and a library
 * would cost more bytes than the coastline data itself. A point is only
 * drawn when it is on the near face of the sphere, which is what gives the
 * outline its edge and hides pins on the far side.
 *
 * Everything is redrawn on an animation frame straight into the DOM through
 * refs, never through React state. Re-rendering ~2,500 projected points
 * sixty times a second through the virtual DOM would drop frames; writing
 * the path strings and pin positions directly does not.
 *
 * The frame loop only runs while `spinning` is true — the parent stops it
 * when the section scrolls out of view, so an idle tab is not turning a
 * globe nobody is looking at.
 */

const RAD = Math.PI / 180;
const SIZE = 520;
const R = 236;
const C = SIZE / 2;

/** Degrees per second the globe turns when it is left alone. */
const DRIFT = 11;
/** How much of its speed a flung globe keeps each frame after release. */
const FRICTION = 0.94;
/** Movement under this many pixels counts as a click, not a drag. */
const CLICK_SLOP = 6;
/** How near a click has to land to count as picking that country. */
const PICK_RADIUS = 95;
/** How quickly it eases when sent to a country: fraction of the gap per frame. */
const EASE = 0.085;

export interface GlobePoint {
  name: string;
  /** [longitude, latitude] in degrees */
  at: [number, number];
}

interface Rotation {
  lambda: number;
  phi: number;
}

/** Keeps the globe from rolling over the poles. */
const clampTilt = (phi: number) => Math.max(-72, Math.min(72, phi));

/** Screen position of a lon/lat, or null when it is round the back. */
function project(lon: number, lat: number, rot: Rotation) {
  const dl = (lon - rot.lambda) * RAD;
  const p = lat * RAD;
  const p0 = rot.phi * RAD;
  const cosc =
    Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(dl);
  if (cosc < 0) return null;
  return {
    x: C + R * (Math.cos(p) * Math.sin(dl)),
    y: C - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(dl)),
  };
}

/** Turns a run of lon/lat into an SVG path, breaking it where it goes behind. */
function toPath(ring: readonly (readonly [number, number])[], rot: Rotation) {
  let d = "";
  let drawing = false;
  for (const [lon, lat] of ring) {
    const q = project(lon, lat, rot);
    if (!q) {
      drawing = false;
      continue;
    }
    d += `${drawing ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`;
    drawing = true;
  }
  return d;
}

/* Meridians and parallels, built once. They are lines of constant longitude
   and latitude, so they are just as much data as the coastline. */
const GRATICULE: [number, number][][] = [];
for (let lon = -180; lon < 180; lon += 30) {
  const line: [number, number][] = [];
  for (let lat = -90; lat <= 90; lat += 5) line.push([lon, lat]);
  GRATICULE.push(line);
}
for (let lat = -60; lat <= 60; lat += 30) {
  const line: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 6) line.push([lon, lat]);
  GRATICULE.push(line);
}

export default function Globe({
  points,
  active,
  spinning,
  onSelect,
}: {
  points: GlobePoint[];
  active: number;
  spinning: boolean;
  onSelect: (index: number) => void;
}) {
  const landRef = useRef<SVGPathElement>(null);
  const gridRef = useRef<SVGPathElement>(null);
  const pinRefs = useRef<(SVGGElement | null)[]>([]);
  const rot = useRef<Rotation>({ lambda: 10, phi: 12 });
  /* Where the globe is heading, when it has been sent somewhere */
  const target = useRef<Rotation | null>(null);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  /* Speed carried over from a drag, so a flung globe keeps going and slows */
  const spin = useRef({ lambda: 0, phi: 0 });
  const spinRef = useRef(spinning);
  spinRef.current = spinning;

  /* Send the active country round to the front whenever it changes — a pin
     on the far side is no use to anyone. */
  useEffect(() => {
    const p = points[active];
    if (!p) return;
    target.current = { lambda: p.at[0], phi: Math.max(-40, Math.min(40, p.at[1])) };
  }, [active, points]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (!drag.current) {
        if (Math.abs(spin.current.lambda) > 0.02 || Math.abs(spin.current.phi) > 0.02) {
          /* Still carrying speed from a fling: coast, and slow down */
          rot.current.lambda += spin.current.lambda;
          rot.current.phi = clampTilt(rot.current.phi + spin.current.phi);
          spin.current.lambda *= FRICTION;
          spin.current.phi *= FRICTION;
        } else if (target.current) {
          /* Ease along the shorter way round, so it never spins the long way */
          let d = target.current.lambda - rot.current.lambda;
          d = ((d + 540) % 360) - 180;
          rot.current.lambda += d * EASE;
          rot.current.phi += (target.current.phi - rot.current.phi) * EASE;
          if (Math.abs(d) < 0.4) target.current = null;
        } else if (spinRef.current) {
          rot.current.lambda += DRIFT * dt;
        }
      }

      const r = rot.current;
      if (landRef.current) {
        landRef.current.setAttribute(
          "d",
          GLOBE_RINGS.map((ring) => toPath(ring, r)).join("")
        );
      }
      if (gridRef.current) {
        gridRef.current.setAttribute(
          "d",
          GRATICULE.map((line) => toPath(line, r)).join("")
        );
      }
      points.forEach((p, i) => {
        const g = pinRefs.current[i];
        if (!g) return;
        const q = project(p.at[0], p.at[1], r);
        if (!q) {
          g.style.display = "none";
          return;
        }
        g.style.display = "";
        g.setAttribute("transform", `translate(${q.x.toFixed(1)},${q.y.toFixed(1)})`);
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  /* Dragging turns the globe. The pixel-to-degree conversion is taken from
     the sphere's own radius on screen, so the surface travels with the
     pointer instead of at some arbitrary rate — a small globe turns less per
     pixel than a large one, which is what makes it feel like an object. */
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    target.current = null;
    spin.current = { lambda: 0, phi: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const perPixel = 90 / ((rect.width / SIZE) * R);   // degrees per pixel
    const dx = (e.clientX - d.x) * perPixel;
    const dy = (e.clientY - d.y) * perPixel;
    rot.current.lambda += dx;
    rot.current.phi = clampTilt(rot.current.phi - dy);
    /* Remember the last movement as speed, so letting go throws the globe */
    spin.current = { lambda: dx, phi: -dy };
    d.moved += Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y);
    d.x = e.clientX;
    d.y = e.clientY;
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d) return;
    /* A press that barely moved is a click: pick whichever destination the
       pointer landed nearest, so the whole globe is a target rather than
       eight small dots. A real drag keeps its speed and coasts instead. */
    if (d.moved > CLICK_SLOP) return;
    spin.current = { lambda: 0, phi: 0 };
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const px = (e.clientX - rect.left) * scale;
    const py = (e.clientY - rect.top) * scale;
    let best = -1;
    let bestDist = PICK_RADIUS;
    points.forEach((point, i) => {
      const q = project(point.at[0], point.at[1], rot.current);
      if (!q) return;
      const dist = Math.hypot(q.x - px, q.y - py);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best >= 0) onSelect(best);
  };

  return (
    <svg
      className="globe"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Rotating globe showing our study destinations"
    >
      <circle className="globe-edge" cx={C} cy={C} r={R} />
      <path className="globe-grid" ref={gridRef} />
      <path className="globe-land" ref={landRef} />
      {points.map((p, i) => (
        <g
          key={p.name}
          ref={(el) => {
            pinRefs.current[i] = el;
          }}
          className={i === active ? "globe-pin is-on" : "globe-pin"}
          role="button"
          tabIndex={0}
          aria-label={`Show ${p.name}`}
          /* No onClick here: the globe picks the nearest destination on
             pointerup, so a pin click is already handled and a second
             handler would fire for the same press. */
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(i);
            }
          }}
        >
          {/* An invisible disc gives the pin a target worth aiming at */}
          <circle className="globe-pin-hit" r="14" />
          {i === active && <circle className="globe-pin-halo" r="13" />}
          <circle className="globe-pin-dot" r="5.5" />
        </g>
      ))}
    </svg>
  );
}
