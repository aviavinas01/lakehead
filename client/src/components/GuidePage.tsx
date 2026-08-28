import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "./HeroOrbit";
import { Check, Arrow, Shot } from "./destinationBits";
import { armReveals } from "../lib/reveal";
import TypeStack from "./TypeStack";
import type { Block, Guide, HeadPart } from "../data/guides/types";

/**
 * Renders a destination guide from data — see data/guides/types.ts for the
 * shape and the editorial rules.
 *
 * These pages run to twenty-odd sections, which is only readable because of
 * the furniture: a contents rail that tracks position, sections that arrive
 * as you reach them, and a rotation of callout styles so the eye has
 * somewhere to rest. Take those away and it is a wall of text.
 *
 * The whole file exists so that adding a country is writing prose rather
 * than JSX, and so a change to how a "Did you know" looks happens once
 * rather than six times.
 */

function Head({ parts }: { parts: HeadPart[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <span
            key={i}
            className={
              p.as === "accent" ? "h-accent" : p.as === "outline" ? "h-outline" : "usa-shout"
            }
          >
            {p.text}
          </span>
        )
      )}
    </>
  );
}

/** Tap-to-answer. The reply is the payload; the choice is just the way in. */
function Choice({ block }: { block: Extract<Block, { t: "choice" }> }) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = block.options.find((o) => o.key === picked);
  return (
    <div className="prompt" data-reveal>
      <p className="prompt-tag">{block.tag}</p>
      <h3>{block.question}</h3>
      <div className="prompt-options">
        {block.options.map((o) => (
          <button
            key={o.key}
            type="button"
            className={picked === o.key ? "is-on" : undefined}
            onClick={() => setPicked(picked === o.key ? null : o.key)}
            aria-pressed={picked === o.key}
          >
            <span aria-hidden="true">{o.key}</span>
            {o.label}
          </button>
        ))}
      </div>
      <p className="prompt-reply" role="status" aria-live="polite">
        {chosen ? chosen.reply : block.resting}
      </p>
    </div>
  );
}

/** Keeps the joke: pick everything and it tells you what you have done. */
function Priorities({ block }: { block: Extract<Block, { t: "priorities" }> }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (p: string) =>
    setPicked((c) => (c.includes(p) ? c.filter((x) => x !== p) : [...c, p]));

  const reply =
    picked.length === 0
      ? "Pick your top three."
      : picked.length === block.items.length
        ? "Congratulations — you have invented a wish list, not a shortlist."
        : picked.length > 3
          ? `That is ${picked.length}. A shortlist means giving something up; try narrowing it to three.`
          : picked.length === 3
            ? "Three. That is a shortlist you can actually filter universities with."
            : `${picked.length} so far — keep going.`;

  return (
    <div className="prompt" data-reveal>
      <p className="prompt-tag">{block.tag}</p>
      <h3>{block.question}</h3>
      <div className="prompt-chips">
        {block.items.map((p) => (
          <button
            key={p}
            type="button"
            className={picked.includes(p) ? "is-on" : undefined}
            onClick={() => toggle(p)}
            aria-pressed={picked.includes(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <p className="prompt-reply" role="status" aria-live="polite">{reply}</p>
    </div>
  );
}

function Chevron() {
  return (
    <span className="ck-chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

function Render({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return <p data-reveal>{block.text}</p>;
    case "pull":
      return <p className="usa-pull" data-reveal>{block.text}</p>;
    case "quip":
      return <p className="quip" data-reveal>{block.text}</p>;
    case "dyk":
      return (
        <aside className="dyk" data-reveal>
          <p className="dyk-tag">Did you know?</p>
          {block.text.map((t, i) => <p key={i}>{t}</p>)}
        </aside>
      );
    case "warn":
      return (
        <div className={`usa-warn${block.hard ? " usa-warn-hard" : ""}`} data-reveal>
          <p className="usa-warn-tag">{block.tag}</p>
          <p>{block.text}</p>
          {block.more && <p className="usa-warn-more">{block.more}</p>}
        </div>
      );
    case "cards":
      return (
        <div className="usa-cards" data-reveal>
          {block.items.map((c) => (
            <div className="usa-card" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      );
    case "chips":
      return (
        <ul className={`usa-chips${block.ivy ? " usa-chips-ivy" : ""}`} data-reveal>
          {block.items.map((c) => <li key={c}>{c}</li>)}
        </ul>
      );
    case "checks":
      return (
        <ul className={`dpage-checks${block.two ? " dpage-checks-2" : ""}`} data-reveal>
          {block.items.map((c) => (
            <li key={c}><span aria-hidden="true"><Check /></span>{c}</li>
          ))}
        </ul>
      );
    case "questions":
      return (
        <ol className="usa-questions" data-reveal>
          {block.items.map((q, i) => (
            <li key={q}>
              <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {q}
            </li>
          ))}
        </ol>
      );
    case "types":
      /* A pinned stack rather than a column of rows — see TypeStack. Not
         marked data-reveal: it drives its own motion from scroll position
         and a one-shot fade on top of that would fight it. */
      return <TypeStack items={block.items} />;
    case "myths":
      return (
        <div className="usa-myths" data-reveal>
          {block.items.map((m) => (
            <div className="usa-myth" key={m.myth}>
              <p className="usa-myth-claim">&ldquo;{m.myth}&rdquo;</p>
              <p className="usa-myth-truth">{m.truth}</p>
            </div>
          ))}
        </div>
      );
    case "faq":
      return (
        <div className="ck" data-reveal>
          {block.items.map((f) => (
            <details className="ck-item" key={f.q}>
              <summary>
                <span className="ck-head"><strong>{f.q}</strong></span>
                <Chevron />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      );
    case "roadmap":
      return (
        <ol className="usa-roadmap" data-reveal>
          {block.items.map((r, i) => (
            <li key={r}>
              <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <p>{r}</p>
            </li>
          ))}
        </ol>
      );
    case "compare":
      return (
        <>
          <div className="usa-compare" data-reveal>
            <div>
              <span className="usa-compare-label">{block.a.label}</span>
              <strong>{block.a.value}</strong>
            </div>
            <div className="usa-compare-x" aria-hidden="true">{block.x}</div>
            <div>
              <span className="usa-compare-label">{block.b.label}</span>
              <strong>{block.b.value}</strong>
            </div>
          </div>
          <p className="usa-compare-note" data-reveal>{block.note}</p>
        </>
      );
    case "band":
      return (
        <figure className="usa-band" data-reveal>
          <Shot src={block.src} alt="" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "callout":
      return (
        <div className="dpage-callout" data-reveal>
          <h3>{block.title}</h3>
          <p>{block.text}</p>
          <Link className="dpage-callout-btn" to="/contact">
            {block.cta} <Arrow />
          </Link>
        </div>
      );
    case "req":
      return (
        <div className="dpage-req" data-reveal>
          <div className="dpage-req-head">
            <h3>Latest requirements at a glance</h3>
            <span className="dpage-req-stamp">Last reviewed {block.lastReviewed}</span>
          </div>
          <dl className={`dpage-req-grid${block.items.length > 4 ? " dpage-req-grid-5" : ""}`}>
            {block.items.map((it) => (
              <div key={it.label}>
                <dt>{it.label}</dt>
                <dd>
                  {it.value}
                  {it.note && <span className="dpage-req-note">{it.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="dpage-req-source">
            Requirements and charges change. Always confirm the current
            position with{" "}
            <a href={block.source.href} target="_blank" rel="noopener noreferrer">
              {block.source.label}
            </a>{" "}
            before you apply.
          </p>
        </div>
      );
    case "table":
      return (
        <div className="dpage-table-wrap" data-reveal>
          <div className="dpage-req-head">
            <h3>{block.title}</h3>
            <span className="dpage-req-stamp">{block.stamp}</span>
          </div>
          <div className="dpage-table-scroll">
            <table className="dpage-table">
              <thead>
                <tr>
                  <th scope="col">{block.head[0]}</th>
                  <th scope="col">{block.head[1]}</th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r) => (
                  <tr key={r.k}>
                    <th scope="row">{r.k}</th>
                    <td>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dpage-table-note">{block.note}</p>
        </div>
      );
    case "choice":
      return <Choice block={block} />;
    case "priorities":
      return <Priorities block={block} />;
    case "reflect":
      return (
        <div className="prompt prompt-quiet" data-reveal>
          <p className="prompt-tag">{block.tag}</p>
          <h3>{block.question}</h3>
          <p className="usa-fill">{block.line}</p>
          <p className="prompt-reply">{block.reply}</p>
        </div>
      );
  }
}

export default function GuidePage({ guide }: { guide: Guide }) {
  const [active, setActive] = useState(guide.sections[0]?.id ?? "");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = `${guide.name} | Lakehead Education`;
    return () => {
      document.title = previous;
    };
  }, [guide.name]);

  /* Everything marked data-reveal arrives as it reaches the viewport, then
     stays put — a page this long would otherwise replay itself at anyone
     scrolling back for something they half-read.

     A direct sweep, not an IntersectionObserver: an observer never fires for
     an element that goes from below the viewport to above it in one jump —
     which is what the contents rail, a fast scroll, and a restored scroll
     position all do — and such an element then stays hidden forever while
     still holding its full height. That is where the white gaps in the
     middle of these pages came from. See lib/reveal.ts. */
  useEffect(() => {
    /* Re-armed per guide, because the nodes are different ones. */
    if (!root.current) return;
    return armReveals(root.current);
  }, [guide]);

  /* Which entry the rail highlights. The margins mean it changes when a
     heading reaches the upper third, which is where people read from. */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    guide.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [guide]);

  return (
    <article className="dpage usa" ref={root}>
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src={guide.hero} alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              {guide.name}
            </p>
            <h1><Head parts={guide.head} /></h1>
            <p className="dpage-lead">{guide.lead}</p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Talk to Our Counsellors →</Link>
              <a className="dpage-jump" href={guide.jump.to}>
                {guide.jump.label} <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="usa-shell container">
        <nav className="usa-toc" aria-label="On this page">
          <p className="usa-toc-tag">On this page</p>
          <ol>
            {guide.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={active === s.id ? "is-here" : undefined}>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="usa-body">
          {guide.sections.map((s) => (
            <section id={s.id} className="usa-sec" key={s.id}>
              <h2 className="usa-h2" data-reveal><Head parts={s.head} /></h2>
              {s.blocks.map((b, i) => <Render block={b} key={i} />)}
            </section>
          ))}
        </div>
      </div>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>{guide.cta.head}</h2>
            <p>{guide.cta.text}</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
