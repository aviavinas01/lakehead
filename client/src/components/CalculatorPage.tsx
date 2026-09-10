import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "./destinationBits";
import { CALCULATORS, calculatorPath, type Calculator } from "../data/calculators";

/**
 * The frame every calculator page sits in — /resources/<slug>.
 *
 * ------------------------------------------------------------------
 * WHY THESE PAGES LOOK NOTHING LIKE THE REST OF THE SITE.
 *
 * Every other page here opens on a full-bleed photograph with the navbar
 * floating over it. These deliberately do not. A calculator is a tool
 * somebody arrived at with a question and wants gone in twenty seconds —
 * usually from a search result, often on a phone, frequently at eleven at
 * night the day before an application closes. A 70vh photograph between them
 * and the input box is a toll on the way to the only thing on the page.
 *
 * So: no hero, no picture, no scrim. A very large headline on white, one
 * line of standfirst, and then the thing itself. The type carries the page
 * where photography carries the others — which is why the headline is set
 * far bigger here than a `dpage-title` and why almost nothing else on the
 * page competes with it.
 *
 * THE FIVE PAGES SHARE THIS SHELL AND NOTHING ELSE. Each owns its own
 * inputs, because an IELTS band selector and a marksheet with a row per
 * subject are not the same shape and a component abstract enough to be both
 * would be worse than either. What is shared is the frame, the crumb, the
 * heading treatment, the small print and the rail of the other four.
 * ------------------------------------------------------------------
 */

export default function CalculatorPage({
  calc,
  children,
  /**
   * The working: the formula, the table it applied, whatever the student
   * needs to check the answer by hand. Every calculator here passes one —
   * see the note at the top of lib/grading.ts for why that is not optional.
   */
  method,
}: {
  calc: Calculator;
  children: ReactNode;
  method: ReactNode;
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${calc.name} | Lakehead Education`;
    return () => {
      document.title = previous;
    };
  }, [calc.name]);

  /* The other four, in the order data/calculators.ts lists them. */
  const others = CALCULATORS.filter((c) => c.slug !== calc.slug);

  return (
    <article className="calc">
      <header className="calc-head">
        <div className="container">
          <p className="calc-crumb">
            <Link to="/resources">Student Resources</Link>
          </p>
          <h1 className="calc-h1">
            {calc.head[0]}
            <span className="h-accent">{calc.head[1]}</span>
          </h1>
          <p className="calc-lead">{calc.lead}</p>
        </div>
      </header>

      {/* The tool. Everything above is introduction and everything below is
          small print; this is what the page is for. */}
      <section className="calc-main">
        <div className="container">{children}</div>
      </section>

      <section className="calc-method">
        <div className="container">
          <h2 className="calc-sub">How this is worked out</h2>
          <div className="calc-method-body">{method}</div>
        </div>
      </section>

      {/* Nothing here is an offer or a promise, and the line says so once,
          in the same words on all five pages. */}
      <section className="calc-fine">
        <div className="container">
          <p>
            These calculators are a guide, not a decision. Every university
            and every visa route applies its own requirements and its own
            conversions, and the awarding bodies revise their scales from time
            to time — check yours against your offer letter and your
            marksheet before you rely on it.{" "}
            <Link to="/contact">Ask us</Link> if a number here does not match
            what you have been told.
          </p>
        </div>
      </section>

      <section className="calc-rail">
        <div className="container">
          <h2 className="calc-sub">The other calculators</h2>
          <ul className="calc-rail-list">
            {others.map((c) => (
              <li key={c.slug}>
                <Link to={calculatorPath(c.slug)}>
                  <span className="calc-rail-name">{c.name}</span>
                  <span className="calc-rail-blurb">{c.blurb}</span>
                  <span className="calc-rail-go" aria-hidden="true">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}

/**
 * The answer, set large.
 *
 * IT IS A LIVE REGION, and that is the accessibility crux of all five pages.
 * There is no submit button anywhere here — the result updates as you change
 * an input, which is right for a tool this small and completely silent to a
 * screen reader unless the region announces itself. `polite` so it waits for
 * a pause rather than interrupting the label being read.
 *
 * `empty` is the state before there is anything to say. A calculator that
 * shows a confident 0.00 before you have entered anything looks broken, and
 * on the GPA pages a zero is also a real and alarming answer.
 */
export function CalcResult({
  value,
  caption,
  note,
  empty,
}: {
  /** The figure itself — a string, since some answers are "below 4.5". */
  value: string;
  /** What the figure is, under it. */
  caption: string;
  /** An optional second line: the working, or a caveat. */
  note?: ReactNode;
  /** Nothing entered yet — the panel holds its shape and says so. */
  empty?: boolean;
}) {
  return (
    <div className={`calc-result${empty ? " is-empty" : ""}`}>
      <output className="calc-result-inner" aria-live="polite">
        {empty ? (
          <p className="calc-result-wait">{caption}</p>
        ) : (
          <>
            <strong className="calc-result-value">{value}</strong>
            <span className="calc-result-caption">{caption}</span>
            {note ? <span className="calc-result-note">{note}</span> : null}
          </>
        )}
      </output>
    </div>
  );
}
