import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { SERVICES } from "../data/services";
import HelpVideo from "../components/HelpVideo";

/**
 * Student Services — the hub behind the navbar's "Student Services" item.
 *
 * The cards, their order and their links all come from data/services.ts, so
 * this page never needs editing to add a service: add the entry there and a
 * card, a page and a dropdown link all follow.
 */

const PRINCIPLES = [
  {
    title: "One counsellor, start to finish",
    text: "You are not handed between departments. The person who reads your transcript is the person who preps you for the interview.",
  },
  {
    title: "Advice before paperwork",
    text: "We would rather talk you out of a course that does not fit than process an application that was never going to serve you.",
  },
  {
    title: "Nothing promised that is not ours to give",
    text: "Admission and visa decisions belong to institutions and governments. What we control is that your application gives them nothing to query.",
  },
];

export default function Services() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Student Services | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage dpage-ruled">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/hero-services.jpg" alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Student Services
            </p>
            <h1>
              Everything between the first question and{" "}
              <span className="h-accent">the day you land</span>
            </h1>
            <p className="dpage-lead">
              Studying abroad is a long sequence of decisions, and most of them
              depend on the ones before. Our services are built to be taken in
              order — or picked from, if you already know which part you need
              help with.
            </p>
            <p>
              From the first counselling session through test preparation,
              applications, funding, the visa and finding somewhere to live,
              qualified consultants handle the paperwork and the preparation
              and tell you plainly where you stand.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Book a Consultation →</Link>
              <Link className="dpage-jump" to="/study-abroad">
                Explore destinations <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            What we <span className="h-outline">do</span>
          </h2>
          <p className="dpage-section-lead">
            Each of these has a page of its own. Take them in sequence, or
            come to us for the one part you are stuck on — most students do
            both, at different stages.
          </p>
          <div className="dpage-cards">
            {SERVICES.map((s) => (
              <Link className="dpage-card" to={`/services/${s.slug}`} key={s.slug}>
                <div className="dpage-card-shot">
                  <Shot src={s.image} alt="" />
                </div>
                <div className="dpage-card-body">
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <span className="dpage-card-more">
                    Learn more <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            How we <span className="h-accent">work</span>
          </h2>
          <div className="dpage-paths dpage-paths-3">
            {PRINCIPLES.map((p, i) => (
              <div className="dpage-path" key={p.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              Not sure which one you <span className="h-accent">need?</span>
            </h2>
            <p className="dpage-section-lead">
              Most students do not, at the start. Begin with counselling and
              the rest falls into an order — you will leave the first session
              knowing what has to happen and roughly when.
            </p>
            <ul className="dpage-checks">
              <li><span aria-hidden="true"><Check /></span>The first consultation is free</li>
              <li><span aria-hidden="true"><Check /></span>No obligation to use any other service</li>
              <li><span aria-hidden="true"><Check /></span>Honest advice about what will and will not work</li>
            </ul>
          </div>
          <aside className="dpage-callout">
            <h3>Start with a conversation</h3>
            <p>
              Tell us where you are — mid-degree, just finished, or still
              deciding — and we will tell you what the next step actually is.
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
            <h2>Ready when you are</h2>
            <p>
              Bring your questions. There is no such thing as one that is too
              early or too basic.
            </p>
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
