import { useEffect, useRef, useState } from "react";

/**
 * Partner logos, as a staggered grid of tiles that hold their position and
 * periodically flip to a different logo.
 *
 * This replaced a marquee. The reason is capacity: a scrolling track shows
 * every logo eventually but only ever a handful at once, and it gets slower
 * to watch as the list grows. A fixed grid shows a stable, composed block —
 * and rotating what is inside each tile means the number of partners is no
 * longer limited by how many tiles fit on screen.
 *
 * Add logos by dropping files into client/public/universities/ and adding a
 * line to UNIVERSITIES. Nothing else needs changing: the grid works out how
 * many tiles fit, and the rotation covers however many logos exist. A
 * missing file falls back to the university's name rather than a broken
 * image, so a typo degrades quietly.
 */

const UNIVERSITIES: { name: string; logo: string }[] = [
  { name: "University 1", logo: "/universities/uni-1.jpeg" },
  { name: "University 2", logo: "/universities/uni-2.jpeg" },
  { name: "University 3", logo: "/universities/uni-3.jpeg" },
  { name: "University 4", logo: "/universities/uni-4.jpeg" },
  { name: "University 5", logo: "/universities/uni-5.jpeg" },
  { name: "University 6", logo: "/universities/uni-6.jpeg" },
  { name: "University 7", logo: "/universities/uni-7.jpeg" },
  { name: "University 8", logo: "/universities/uni-8.jpeg" },
  { name: "University 9", logo: "/universities/uni-9.jpeg" },
  { name: "University 10", logo: "/universities/uni-10.jpeg" },
];

const ROWS = 3;
/** How long a tile holds before another one somewhere flips. */
const SWAP_MS = 1900;

/** Tiles per row at a given container width. */
const columnsFor = (w: number) => (w < 460 ? 3 : w < 700 ? 4 : w < 980 ? 5 : 7);

const shuffled = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Which logos start on the board.
 *
 * There are usually more tiles than partners, so some logos have to repeat.
 * Repeating a SHUFFLED full list until the board is full spreads them as
 * evenly as the arithmetic allows — with ten logos in twenty-one tiles every
 * mark appears two or three times. Picking at random instead gives you four
 * of one logo and none of another, which looks like a bug.
 */
function fill(total: number, cols: number): number[] {
  const all = UNIVERSITIES.map((_, i) => i);
  const out: number[] = [];
  while (out.length < total) out.push(...shuffled(all));
  out.length = total;

  /* An even deal can still land two copies of a mark side by side, which is
     the one thing that reads as a mistake rather than a repeat. Swap each
     clash with a later tile that resolves it — a few passes is plenty, and
     the bound means an unresolvable board (two logos, twenty tiles) exits
     rather than spinning. */
  for (let pass = 0; pass < 3; pass++) {
    let clashes = 0;
    for (let i = 0; i < total; i++) {
      if (!neighbours(i, cols, total).some((n) => out[n] === out[i])) continue;
      clashes++;
      for (const j of shuffled([...Array(total).keys()])) {
        if (j === i) continue;
        const clean =
          !neighbours(i, cols, total).some((n) => n !== j && out[n] === out[j]) &&
          !neighbours(j, cols, total).some((n) => n !== i && out[n] === out[i]);
        if (clean) {
          [out[i], out[j]] = [out[j], out[i]];
          break;
        }
      }
    }
    if (clashes === 0) break;
  }
  return out;
}

/** The tiles touching `slot`, so a logo never lands beside a copy of itself. */
function neighbours(slot: number, cols: number, total: number): number[] {
  const row = Math.floor(slot / cols);
  const out: number[] = [];
  if (slot % cols > 0) out.push(slot - 1);
  if (slot % cols < cols - 1 && slot + 1 < total) out.push(slot + 1);
  if (row > 0) out.push(slot - cols);
  if (slot + cols < total) out.push(slot + cols);
  return out;
}

export default function UniversityPartners() {
  const wrap = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(7);
  /** Which logo each tile is currently showing, by index into UNIVERSITIES. */
  const [slots, setSlots] = useState<number[]>([]);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);

  /* Tiles are counted from the measured width rather than rendered and then
     hidden by CSS. A hidden tile would still take its turn in the rotation,
     so on a phone most flips would happen off-screen and the grid would look
     frozen. */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setCols(columnsFor(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Re-deal the board whenever the column count changes. Dealing afresh
     rather than topping up keeps the distribution even — a board that has
     been trimmed and extended a few times drifts. */
  useEffect(() => {
    setSlots(fill(ROWS * cols, cols));
  }, [cols]);

  /* Only rotate while the section is actually on screen. */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running || slots.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setSlots((cur) => {
        if (cur.length === 0) return cur;
        const slot = Math.floor(Math.random() * cur.length);
        const current = cur[slot];

        /* How many tiles each logo currently occupies. The replacement comes
           from whichever logos are showing least — which is the rarest one
           when there are more partners than tiles, and keeps the board even
           when there are fewer. Straight random selection would let one mark
           accumulate four tiles while another disappeared entirely. */
        const count = UNIVERSITIES.map(
          (_, i) => cur.filter((s) => s === i).length
        );
        const banned = new Set(
          [current, ...neighbours(slot, cols, cur.length).map((n) => cur[n])]
        );

        let pool = UNIVERSITIES.map((_, i) => i).filter((i) => !banned.has(i));
        /* With very few logos everything can be banned; drop the neighbour
           rule before dropping the rule that the tile must actually change. */
        if (pool.length === 0) {
          pool = UNIVERSITIES.map((_, i) => i).filter((i) => i !== current);
        }
        if (pool.length === 0) return cur;

        const fewest = Math.min(...pool.map((i) => count[i]));
        const rarest = pool.filter((i) => count[i] === fewest);

        const next = [...cur];
        next[slot] = rarest[Math.floor(Math.random() * rarest.length)];
        return next;
      });
    }, SWAP_MS);

    return () => window.clearInterval(id);
  }, [running, slots.length, cols]);

  const rows = Array.from({ length: ROWS }, (_, r) =>
    slots.slice(r * cols, (r + 1) * cols)
  );

  return (
    <section className="universities">
      <div className="container">
        <h2 className="universities-title">
          Our University <span className="h-accent">Partnerships</span>
        </h2>
      </div>
      {/* aria-hidden: the tiles are a decorative, shuffling sample rather than
          a list. A screen reader announcing a logo that changes every two
          seconds would be noise, so the count is given as text instead. */}
      <div className="uni-grid" ref={wrap} aria-hidden="true">
        {rows.map((row, r) => (
          <div className="uni-row" key={r}>
            {row.map((logoIndex, c) => {
              const uni = UNIVERSITIES[logoIndex];
              if (!uni) return null;
              return (
                <div className="uni-tile" key={`${r}-${c}`}>
                  {broken[uni.logo] ? (
                    <span className="uni-fallback">{uni.name}</span>
                  ) : (
                    /* Keyed on the logo, so React remounts the image when a
                       tile changes and the flip animation replays. */
                    <img
                      key={logoIndex}
                      src={uni.logo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={() =>
                        setBroken((b) => ({ ...b, [uni.logo]: true }))
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="uni-count">
        {UNIVERSITIES.length} partner institutions and counting.
      </p>
    </section>
  );
}
