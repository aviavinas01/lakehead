import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";

/**
 * Career Counselling & Aptitude Testing — /services/career-counselling.
 * A static route, so it takes over from the generic service page.
 *
 * The four test types are staggered rather than stacked, each with its own
 * image and an oversized outlined numeral behind it. The stagger repeats on
 * a four-step cycle in the stylesheet, so adding one needs no CSS — and no
 * heading on this page names a count, for the same reason.
 *
 * The typography does more work here than elsewhere on the site on purpose:
 * this is the page for students who have not decided anything yet, and it
 * should read as an invitation rather than a form.
 */

/* Titles only — this is how the list was supplied, and nine short phrases
   under nine numerals carry themselves. If you want a line of explanation
   under each, add a `text` field and render it below the heading. */
const WHY = [
  "Career guidance and counselling",
  "Effective recruitment and selection",
  "Personal development and skill enhancement",
  "Educational planning and academic success",
  "Promotion and career advancement",
  "Objective assessment",
  "Enhanced self-awareness",
  "Adaptability and future planning",
  "Competitive advantage",
];

const TYPES = [
  {
    name: "Aptitude",
    text: "A valuable tool for seeing an individual's abilities, strengths and potential across different areas. It plays a real part in guiding career decisions, in recruitment, and in personal development — and in whether the education and work that follow turn out to be satisfying ones.",
    image: "/services/career/aptitude.jpg",
  },
  {
    name: "Interest",
    text: "Sometimes called an interest inventory. It identifies your preferences — what you are drawn to and what you are not, across activities, subjects and career fields — so that decisions about study, career and personal development are made with your actual inclinations in front of you rather than assumed.",
    image: "/services/career/interest.jpg",
  },
  {
    name: "Personality",
    text: "Designed to assess and evaluate the different aspects of who you are. It surfaces the patterns of behaviour, preferences and traits that characterise a person — the things that tend to decide whether a working environment suits you, long after the subject matter has stopped being the interesting part.",
    image: "/services/career/personality.jpg",
  },
  {
    name: "Multiple Intelligence",
    text: "Built on Howard Gardner's theory that intelligence is not one thing but several. Gardner set out seven kinds originally and extended the list later, and an MI assessment measures your strengths and preferences across them — which is often where a student discovers the ability nobody has been testing them on.",
    image: "/services/career/intelligence.jpg",
  },
];

const PROCESS = [
  {
    title: "Online testing",
    text: "Sit it from the comfort of home. There is no need to travel anywhere for the assessment.",
  },
  {
    title: "Around 2.5 hours",
    text: "The test is designed to be finished in roughly two and a half hours at a leisurely pace. It is not a race, and rushing it wastes it.",
  },
  {
    title: "Expert review",
    text: "A clinical psychologist checks the report carefully before it is shared with you. Nobody is handed a machine-generated score sheet and left to interpret it alone.",
  },
  {
    title: "A detailed report",
    text: "Your scores, a narrative overview, suggested study and work options — and, importantly, an explanation of how to actually use any of it.",
  },
];

const REPORT = [
  "An explanation of the report, and how to use it",
  "Your scores across the aptitude, interest and personality tests",
  "A narrative overview and a summary of the results",
  "Suggested study and work options",
  "A consultation to talk it through — in person, by video call or by phone",
];

export default function CareerCounselling() {
  const steps = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Career Counselling & Aptitude Test | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  /* Each type arrives as it reaches the viewport, then stops being watched —
     scrolling back up does not replay it. Same approach as the visa page. */
  useEffect(() => {
    const nodes = steps.current.filter((n): n is HTMLDivElement => !!n);
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <article className="dpage cc">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/services/career.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services">Student Services</Link>
            </p>
            {/* Three weights and three treatments in one line — the page's
                argument is that this decision deserves more thought than the
                usual, and the type says so before the copy does. */}
            <h1 className="cc-title">
              <span className="cc-thin">Career counselling</span>
              <span className="cc-fat">&amp; aptitude</span>
              <span className="cc-accent">testing.</span>
            </h1>
            <p className="dpage-lead">
              Career counselling — career guidance, career coaching, whatever
              you want to call it — is the process of helping you make an
              informed decision about your career and the work that follows
              it. Not a verdict handed down: a decision you make with the
              whole picture in front of you.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Free Expert Consultation →</Link>
              <a className="dpage-jump" href="#types">
                See the tests <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title cc-h2">
              Academic pathway <span className="h-accent">planning</span>
            </h2>
            <p className="dpage-section-lead">
              A structured process for mapping out the educational journey that
              gets you to your career goals. Our counsellors help you set the
              objectives, choose the courses that actually serve them, and
              build a roadmap you can follow rather than a wish.
            </p>
            <p className="dpage-fineprint">
              It works in both directions: sometimes the destination decides
              the course, and sometimes looking honestly at the courses
              available changes the destination. Both are useful outcomes.
            </p>
          </div>
          <aside className="dpage-callout">
            <h3>Start with the assessment</h3>
            <p>
              Most students find it easier to talk about their future once
              there is something concrete on the table to react to.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Book a consultation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title cc-h2">
            Why aptitude tests <span className="h-outline">matter</span>
          </h2>
          <p className="dpage-section-lead">
            They are designed to assess the inherent and acquired abilities,
            strengths and potential a person has in specific areas — which
            turns out to be useful well beyond choosing a course.
          </p>
          <ol className="cc-why">
            {WHY.map((w, i) => (
              <li key={w}>
                <span className="cc-why-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{w}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="dpage-section" id="types">
        <div className="container">
          <h2 className="dpage-title cc-h2">
            The tests we <span className="h-accent">actually run</span>
          </h2>
          <p className="dpage-section-lead">
            Four assessments, each answering a different question about you.
            Taken together they are considerably more useful than any one of
            them alone.
          </p>

          <div className="cc-steps">
            {TYPES.map((t, i) => (
              <div
                className="cc-step"
                key={t.name}
                ref={(el) => {
                  steps.current[i] = el;
                }}
              >
                <span className="cc-step-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <figure className="cc-shot">
                  <Shot src={t.image} alt="" />
                </figure>
                <div className="cc-body">
                  <p className="cc-kicker">Test {String(i + 1).padStart(2, "0")}</p>
                  <h3>{t.name}</h3>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title cc-h2">
            How the testing <span className="h-accent">works</span>
          </h2>
          <div className="cc-process">
            {PROCESS.map((p, i) => (
              <div className="cc-process-item" key={p.title}>
                <span className="cc-process-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          <div className="dpage-split cc-report">
            <div>
              <h3 className="dpage-sub">What the report contains</h3>
              <ul className="dpage-checks">
                {REPORT.map((r) => (
                  <li key={r}>
                    <span aria-hidden="true"><Check /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <aside className="dpage-callout">
              <h3>Talk it through with us</h3>
              <p>
                The consultation is part of it, not an extra. A report nobody
                explains is a document, not a decision.
              </p>
              <Link className="dpage-callout-btn" to="/contact">
                Book a consultation <Arrow />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Their line, and the most important sentence on the page */}
      <section className="cc-quote">
        <div className="container">
          <p>
            The results are not a benchmark. They are an{" "}
            <em>indicator</em> — a platform to work from.
          </p>
          <span>What you do with it is still yours to decide.</span>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Still deciding?</h2>
            <p>Good. That is exactly the right time to talk to us.</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
