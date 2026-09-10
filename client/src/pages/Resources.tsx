import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "../components/destinationBits";
import { CALCULATORS, calculatorPath } from "../data/calculators";

/**
 * Student Resources — /resources.
 *
 * The navbar has had a "Resources" item since the site was built, and until
 * now it pointed at /blog: a section promising one thing and delivering
 * another, with an item in its own dropdown ("Useful Documents") pointing at
 * the same place a second time. This is the page it was always meant to
 * open, and the calculators are the first thing on it that is genuinely a
 * resource rather than a link elsewhere.
 *
 * DELIBERATELY PLAIN, like the calculators it leads to. No hero photograph,
 * no scrim, no band of figures — somebody here is looking for a tool, and
 * the fastest way to give them one is a large heading and a list. The
 * reading sits underneath, because a student who wanted an article would
 * have gone to the blog.
 */

/* The rest of what /resources gathers up. These are existing sections
   rather than new ones — the page's job is to be the one place they are all
   named, not to duplicate them. */
const READING = [
  {
    to: "/blog",
    name: "Blog & articles",
    blurb:
      "Longer pieces on applications, visas, tests and settling in, written by the counsellors who handle them.",
  },
  {
    to: "/news",
    name: "News",
    blurb:
      "Visa rule changes, intake announcements and partner university news, with a line on why each one matters.",
  },
  {
    to: "/study-abroad",
    name: "Destination guides",
    blurb:
      "Seven full guides — universities, courses, costs, scholarships and the visa route for each country we place students in.",
  },
  {
    to: "/services/test-preparation",
    name: "Test preparation",
    blurb:
      "How we prepare students for IELTS, TOEFL, PTE, Duolingo and the SAT, and which one your universities actually want.",
  },
];

export default function Resources() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Student Resources | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="calc rsx">
      <header className="calc-head">
        <div className="container">
          <p className="calc-crumb">Lakehead Education</p>
          <h1 className="calc-h1">
            Student <span className="h-accent">resources</span>
          </h1>
          <p className="calc-lead">
            Five calculators that answer the questions we are asked most
            often, and the reading behind them. Everything here is free, works
            without an account, and shows its working.
          </p>
        </div>
      </header>

      <section className="calc-main">
        <div className="container">
          <h2 className="calc-sub">Calculators</h2>
          <ul className="rsx-grid">
            {CALCULATORS.map((c) => (
              <li key={c.slug}>
                <Link className="rsx-card" to={calculatorPath(c.slug)}>
                  <h3>{c.name}</h3>
                  <p>{c.blurb}</p>
                  <span className="rsx-card-go">
                    Open <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="calc-method">
        <div className="container">
          <h2 className="calc-sub">Reading</h2>
          <ul className="calc-rail-list">
            {READING.map((r) => (
              <li key={r.to}>
                <Link to={r.to}>
                  <span className="calc-rail-name">{r.name}</span>
                  <span className="calc-rail-blurb">{r.blurb}</span>
                  <span className="calc-rail-go" aria-hidden="true">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="calc-fine">
        <div className="container">
          <p>
            The calculators are a guide, not a decision. Universities and visa
            routes set their own requirements and their own conversions, and
            the awarding bodies revise their scales from time to time — check
            any figure against your offer letter and your marksheet before you
            rely on it. If something here does not match what you have been
            told, <Link to="/contact">talk to a counsellor</Link>.
          </p>
        </div>
      </section>
    </article>
  );
}
