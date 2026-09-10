import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../home/HeroOrbit";
import { Check, Arrow, Shot } from "../shared/destinationBits";
import { armReveals } from "../../lib/reveal";
import TypeStack from "./TypeStack";
import type { Block, Guide, HeadPart } from "../../data/guides/types";
import HelpVideo from "../shared/HelpVideo";
import CallbackStrip from "../shared/CallbackStrip";
import RelatedReading from "./RelatedReading";

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

/**
 * A heading, in its parts.
 *
 * AN ACCENTED PHRASE IS QUOTED AS WELL AS COLOURED — “Australia?” rather
 * than a plain coloured word. The marks do most of the work on their own,
 * which lets the colour sit back and be an accent rather than the only thing
 * saying "this is the phrase that matters"; and they make the heading read
 * as the page repeating the reader's own question back at them, which is
 * what these openings are.
 *
 * Curly, not straight. The straight ones are a typewriter's compromise and
 * look like a code sample at display size.
 *
 * The marks live HERE and not in the data, so every guide gets them without
 * five files having to remember, and dropping the treatment later is one
 * edit rather than thirty. `outline` and `shout` parts are untouched: those
 * are shapes rather than phrases, and quoting them would be quoting a
 * texture. */
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
            {p.as === "accent" ? `\u201C${p.text}\u201D` : p.text}
          </span>
        )
      )}
    </>
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
          <Shot src={guide.hero} alt="" priority />
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
        {/* The left rail: where you are in this page, and what else there is
            to read about this destination. Both are navigation away from the
            middle of a very long article, which is why they share a column
            and a sticky position rather than the articles block being
            dropped at the foot of the page where nobody deep in section
            eleven will ever reach it. Below 1080px the column collapses and
            the rail moves under the body — see .usa-rail in styles.css. */}
        <div className="usa-rail">
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

          <RelatedReading page={guide.page} />
        </div>

        <div className="usa-body">
          {guide.sections.map((s) => (
            <section id={s.id} className="usa-sec" key={s.id}>
              <h2 className="usa-h2" data-reveal><Head parts={s.head} /></h2>
              {s.blocks.map((b, i) => <Render block={b} key={i} />)}
            </section>
          ))}
        </div>
      </div>

      <CallbackStrip service="study-abroad" />

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
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />
    </article>
  );
}
