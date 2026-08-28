import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { revealInit } from "../lib/reveal";

/**
 * Visa Guidance — /services/visa-guidance. A static route, so it takes over
 * from the generic service page for this slug.
 *
 * The page is a sequence: a short brief, then four stages that reveal one at
 * a time as you scroll, each with its own image and a connector drawn
 * between them. Each stage watches itself into view rather than the whole
 * list animating at once — the point is that it unfolds at the pace you
 * scroll, not that it all arrives together the moment the section appears.
 *
 * Note what the copy does NOT say: nothing here promises an approval, a
 * timeline, or a reduced chance of refusal. The decision belongs to the
 * government concerned, and a visa page that implies otherwise is the single
 * most dangerous page a consultancy can publish.
 */

const STAGES = [
  {
    title: "Personalised guidance",
    text: "Every application is a set of particular circumstances, not a form. Our consultants sit down with yours — your course, your funding, your history — and work out how it lines up against what your specific route actually asks for. From there we tell you what needs preparing and in what order.",
    image: "/services/visa/guidance.jpg",
  },
  {
    title: "Application support",
    text: "We complete the application with you and get the documents in on time and in the form each route requires. Most avoidable problems are small ones — a date that disagrees with another document, a name spelled two ways, evidence held for a few days too few — and they are far easier to catch before submission than to explain afterwards.",
    image: "/services/visa/application.jpg",
  },
  {
    title: "Mock interviews",
    text: "Where your route involves an interview, we run it first. Real questions, real conditions, and honest feedback afterwards — which is usually about pace and clarity rather than content. Nobody explains their own plans well when it is the first time they have said them out loud.",
    image: "/services/visa/interview.jpg",
  },
  {
    title: "Ongoing support",
    text: "Submitting is not the end of it. Processing can take a while, and it is a genuinely anxious stretch — so we stay reachable for the questions that come up while you wait, and tell you plainly what is normal and what is worth acting on.",
    image: "/services/visa/support.jpg",
  },
];

/** The dashed connector drawn between one stage and the next. */
const Connector = () => (
  <div className="vg-connector" aria-hidden="true">
    <svg viewBox="0 0 200 120" preserveAspectRatio="none">
      <path d="M170 0 C170 60 30 60 30 120" />
    </svg>
  </div>
);

export default function VisaGuidance() {
  const stages = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Visa Guidance | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  /* One observer, every stage. `is-in` is added and the element is dropped
     from the observer — a stage that has arrived stays arrived, so scrolling
     back up does not replay the whole page at you. */
  useEffect(() => {
    const nodes = stages.current.filter((n): n is HTMLDivElement => !!n);
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
      /* Fires a little before the block is fully on screen, so the movement
         is finishing as it reaches a comfortable reading position rather
         than starting there. */
      revealInit(0.15, "-10%")
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/services/visa.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services">Student Services</Link>
            </p>
            <h1>
              Visa <span className="h-accent">Guidance</span>
            </h1>
            <p className="dpage-lead">
              The student visa is one of the more consequential parts of the
              journey, and from the outside the requirements can look
              genuinely overwhelming — every destination runs its own route,
              its own thresholds and its own paperwork, and all of them are
              revised regularly.
            </p>
            <p>
              Our consultants take you through every part of it. Personal
              guidance rather than a checklist, so that what you submit is
              accurate, complete, and says what you actually mean.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Free Expert Consultation →</Link>
              <a className="dpage-jump" href="#how">
                How we help <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section" id="how">
        <div className="container">
          <h2 className="dpage-title">
            How our <span className="h-outline">visa assistance</span> works
          </h2>
          <p className="dpage-section-lead">
            Four stages, in the order you will meet them.
          </p>

          <div className="vg-steps">
            {STAGES.map((s, i) => (
              <div key={s.title}>
                {i > 0 && <Connector />}
                <div
                  className="vg-step"
                  ref={(el) => {
                    stages.current[i] = el;
                  }}
                >
                  <figure className="vg-shot">
                    <Shot src={s.image} alt="" />
                  </figure>
                  <div className="vg-copy">
                    <span className="vg-n" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              What we can and cannot{" "}
              <span className="h-accent">promise</span>
            </h2>
            <p className="dpage-section-lead">
              Worth being straight about, because plenty of pages in this
              business are not.
            </p>
            <ul className="dpage-checks">
              <li><span aria-hidden="true"><Check /></span>We will make sure you understand what is being asked for</li>
              <li><span aria-hidden="true"><Check /></span>We will check your application before it goes anywhere</li>
              <li><span aria-hidden="true"><Check /></span>We will confirm current requirements against the official source</li>
              <li><span aria-hidden="true"><Check /></span>We will stay reachable while you wait on a decision</li>
            </ul>
            <p className="dpage-fineprint">
              What we will not do is claim a success rate or predict an
              outcome. Visa decisions are made by the government concerned,
              on their criteria. Anyone telling you otherwise is selling you
              something.
            </p>
          </div>
          <aside className="dpage-callout">
            <h3>Start before you need to</h3>
            <p>
              Most visa problems are timing problems. Come and talk to us
              while the application is still comfortably ahead of you.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Book a consultation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to get started?</h2>
            <p>
              Tell us where you are applying and we will tell you what your
              route actually requires.
            </p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
