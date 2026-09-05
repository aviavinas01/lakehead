import { useEffect, useRef, useState } from "react";

/**
 * The four figures under the hero. Each number rolls up into place the first
 * time the strip is scrolled to, like the digits turning over on a counter.
 *
 * Every digit is its own little window with a tall strip of numerals behind
 * it; the strip is slid up so the right numeral lands in the window. The
 * strip carries several runs of 0-9 rather than one, so a digit spins past a
 * couple of full turns before it settles instead of merely sliding once.
 *
 * The rolling numerals are hidden from screen readers — a strip of forty
 * digits is nonsense read aloud — and the real figure is given as text.
 */

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 1100, suffix: "+", label: "Institution Partners" },
  { value: 760000, suffix: "+", label: "Students Assisted" },
  { value: 200000, suffix: "+", label: "Institution Courses Offered" },
  { value: 10, suffix: "+", label: "Destinations Served" },
];

/** Full turns a digit takes before landing on its number. */
const SPINS = 3;

/* 0-9 laid out SPINS+1 times: the last run holds the digit that is landed on,
   the runs before it are what makes the spin visible. */
const STRIP = Array.from({ length: (SPINS + 1) * 10 }, (_, i) => i % 10);

function RollingNumber({ text, go }: { text: string; go: boolean }) {
  return (
    <span className="roll" aria-hidden="true">
      {text.split("").map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span className="roll-fixed" key={i}>
              {ch}
            </span>
          );
        }
        /* Land on the digit in the final run, so everything before it scrolls
           past on the way. Each digit starts a beat after the one on its
           left, which is what gives the roll its cascade. */
        const stop = SPINS * 10 + Number(ch);
        return (
          <span className="roll-digit" key={i}>
            <span
              className="roll-strip"
              style={{
                /* One cell per numeral passed. The cell height lives in the
                   stylesheet as --roll-h, because the window and the strip
                   are sized by it there and the three have to agree — an
                   `em` hardcoded here would silently stop landing on the
                   right digit the moment that value changed. */
                transform: go
                  ? `translateY(calc(var(--roll-h, 1.34em) * ${-stop}))`
                  : "translateY(0)",
                transitionDelay: `${i * 110}ms`,
              }}
            >
              {STRIP.map((d, n) => (
                <span key={n}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function StatsStrip() {
  const grid = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  /* Rolls once, the first time the strip comes into view. */
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGo(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setGo(true);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="stats-strip">
      <div className="container">
        <div className="stats-grid" ref={grid}>
          {STATS.map((s) => {
            const figure = `${s.value.toLocaleString()}${s.suffix}`;
            return (
              <div className="stat" key={s.label}>
                <strong>
                  <span className="stat-value">{figure}</span>
                  <RollingNumber text={figure} go={go} />
                </strong>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
        <p className="stats-note">(As of Mar&#39;25)*</p>
      </div>
    </section>
  );
}
