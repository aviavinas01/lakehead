import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { armReveals } from "../lib/reveal";
import HelpVideo from "../components/HelpVideo";
import TikTokStrip from "../components/TikTokStrip";

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

/* Every stage ends in a link, which is the shape the block is built to —
   label, heading, paragraph, then somewhere to go. The destinations are all
   pages that exist and are genuinely the next thing for that stage; none of
   them is a link added to fill the slot. */
const STAGES = [
  {
    to: "/contact",
    linkLabel: "Talk to a counsellor",
    title: "Personalised guidance",
    text: "Every application is a set of particular circumstances, not a form. Our consultants sit down with yours — your course, your funding, your history — and work out how it lines up against what your specific route actually asks for. From there we tell you what needs preparing and in what order.",
    image: "/services/visa/guidance.jpg",
  },
  {
    to: "/services/admission-guidance",
    linkLabel: "See how we handle applications",
    title: "Application support",
    text: "We complete the application with you and get the documents in on time and in the form each route requires. Most avoidable problems are small ones — a date that disagrees with another document, a name spelled two ways, evidence held for a few days too few — and they are far easier to catch before submission than to explain afterwards.",
    image: "/services/visa/application.jpg",
  },
  {
    to: "/services/test-preparation",
    linkLabel: "How we prepare you",
    title: "Mock interviews",
    text: "Where your route involves an interview, we run it first. Real questions, real conditions, and honest feedback afterwards — which is usually about pace and clarity rather than content. Nobody explains their own plans well when it is the first time they have said them out loud.",
    image: "/services/visa/interview.jpg",
  },
  {
    to: "/contact",
    linkLabel: "Talk to a counsellor",
    title: "Ongoing support",
    text: "Submitting is not the end of it. Processing can take a while, and it is a genuinely anxious stretch — so we stay reachable for the questions that come up while you wait, and tell you plainly what is normal and what is worth acting on.",
    image: "/services/visa/support.jpg",
  },
];

export default function VisaGuidance() {
  const steps = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Visa Guidance | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  /* The copy fades up as each stage arrives; the photographs do not move at
     all on arrival, because they already have the scroll drift and two
     motions on one block read as fussiness.

     THIS USES armReveals RATHER THAN AN OBSERVER OF ITS OWN, and the reason
     is the failure mode. An IntersectionObserver reports a CHANGE in
     intersection, and several ordinary things — an anchor jump, a fast
     scroll, a restored scroll position on Back — move a block from below the
     fold to above it between two frames without the intersection ever
     changing from zero. The callback never fires, and the stage stays at
     opacity 0 forever. armReveals sweeps positions instead of watching for
     changes, so it cannot miss; and it sets `data-reveal-armed`, which is
     what the CSS hangs its hiding off — so if this code never runs at all,
     the stages are simply visible rather than permanently blank. */
  useEffect(() => {
    const el = steps.current;
    if (!el) return;
    return armReveals(el, ".vg-step");
  }, []);

  return (
    <article className="dpage dpage-ruled">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/services/visa.jpg" alt="" priority />
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

          <div className="vg-steps" ref={steps}>
            {STAGES.map((s, i) => (
              <div key={s.title}>
                <div className="vg-step">
                  <figure className="vg-shot">
                    <Shot src={s.image} alt="" />
                  </figure>
                  {/* Label, heading, paragraph, link — in that order and
                      each on its own line of the hierarchy. The stage number
                      used to be a large outlined numeral over the heading;
                      as a small label above it, it says the same thing and
                      leaves the heading as the largest thing in the block,
                      which is what makes the column read top to bottom. */}
                  <div className="vg-copy">
                    <p className="vg-eyebrow">
                      Stage {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3>{s.title}</h3>
                    <p className="vg-text">{s.text}</p>
                    <Link className="vg-link" to={s.to}>
                      {s.linkLabel}
                      <Arrow />
                    </Link>
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

      {/* Beside the writing it explains rather than on the home page —
          somebody with this question is already here. Renders nothing until
          a clip in this category is published. */}
      <TikTokStrip
        category="visas"
        eyebrow="On TikTok"
        heading={<>Visas, <span className="h-accent">answered</span></>}
      />

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
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />
    </article>
  );
}
