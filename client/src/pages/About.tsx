import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";
import { revealInit } from "../lib/reveal";
import InquiryForm from "../components/InquiryForm";
import { contact } from "../config/contact";

/**
 * Who We Are — /about.
 *
 * The page takes the destination pages' shell (photographic hero, tinted
 * bands, red CTA) and the career page's typographic playfulness — one family,
 * so the play comes from weight, size, stroke and colour rather than from
 * mixing typefaces — and then does something none of the other pages do: it
 * ends with the office itself. The city, a map, and a form, in that order,
 * because someone who has read this far is deciding whether to walk in.
 *
 * PHOTOGRAPHY. Every image here is referenced before it exists. `Shot`
 * degrades a missing file to a tinted panel rather than a broken image, so
 * drop the files into client/public at these paths and they appear with no
 * code change:
 *
 *   /about/hero.jpg          the counselling floor, or the team — wide
 *   /about/counselling.jpg   a counsellor and a student at a desk
 *   /about/classroom.jpg     a test-prep session in progress
 *   /about/office.jpg        the reception, or the front of the building
 *   /about/kathmandu-1.jpg   the city — rooftops, Patan, Boudha
 *   /about/kathmandu-2.jpg   the street the office is on
 *   /about/kathmandu-3.jpg   students outside the office
 *
 * FIGURES. The numbers in FIGURES are placeholders shaped like the real
 * thing. Confirm them with the office before this page goes live — they are
 * the first claims a competitor will check.
 */

/* Placeholders — confirm each figure before publishing. */
const FIGURES = [
  { value: "12,000+", label: "Students guided" },
  { value: "60+", label: "Counsellors and instructors" },
  { value: "180+", label: "Partner institutions" },
  { value: "5,000+", label: "Test-prep graduates" },
  { value: "6", label: "Study destinations" },
  { value: "14+", label: "Years of practice" },
];

const WORK = [
  {
    title: "Counselling",
    text: "The first two hours decide the next two years. We read the transcript, the budget and the ambition together, and only then start naming countries.",
    image: "/about/counselling.jpg",
  },
  {
    title: "Admissions",
    text: "Shortlisting, applications, statements of purpose, financial documentation, deferrals and appeals — handled by the person who counselled you, not passed down a corridor.",
    image: "/about/office.jpg",
  },
  {
    title: "Test preparation",
    text: "IELTS, PTE, TOEFL, Duolingo, SAT, GRE and GMAT, taught in-house by instructors who sit the exams themselves. Foundations first, strategy second, mock tests until the score is repeatable.",
    image: "/about/classroom.jpg",
  },
];

/* The four statements that used to live on a wall in the office. Kept short
   on purpose: a mission nobody can repeat from memory is a paragraph. */
const CREDO = [
  {
    kicker: "Vision",
    title: "To be the name a Nepali family trusts with the biggest decision they will make.",
    text: "Not the loudest consultancy in Kathmandu — the one people are sent to by someone who has already been through it.",
  },
  {
    kicker: "Mission",
    title: "Honest counselling, real teaching, and support that outlasts the visa.",
    text: "Advice you can act on, classes that actually move a score, and a file that stays open long after the departure date.",
  },
  {
    kicker: "Values",
    title: "Integrity. Clarity. Follow-through.",
    text: "Nothing goes into a file that we would not defend in front of a visa officer, because eventually we have to.",
  },
  {
    kicker: "Goal",
    title: "Grow. Sharpen. Outrun ourselves.",
    text: "We measure this year against our own last year, not against whoever is advertising hardest this month.",
  },
];

const PRINCIPLES = [
  {
    title: "The student decides",
    text: "Our job is to put the whole picture on the table — fees, entry requirements, work rights, what the qualification is worth when you come home — and then step back. A decision you made yourself is the only one that survives a difficult first semester.",
  },
  {
    title: "Documents are never negotiable",
    text: "We will not manufacture a bank balance, a work certificate or a sponsor. Students who ask are politely shown the door, and everyone else gets the benefit of a consultancy that visa sections have no reason to distrust.",
  },
  {
    title: "The right course beats the famous name",
    text: "Rankings are a marketing product. Whether a course takes your grades, teaches what you actually want to do, sits in a city you can afford and leads to a visa you can use — that is the shortlist that matters.",
  },
  {
    title: "We say no out loud",
    text: "Some profiles are not ready. Some budgets do not stretch to the country in question. Some applications should wait a semester. Saying so costs us a file and saves you a refusal, a lost fee and a year.",
  },
  {
    title: "One counsellor, start to finish",
    text: "No handover halfway through and no repeating your story to a new face at every stage. The person who sat with you on day one is the person who checks your visa lodgement.",
  },
  {
    title: "It does not end at the airport",
    text: "Pre-departure briefings, bank accounts, first accommodation, the alumni group. Most of what we know about living in Perth or Toronto we learned from students we sent there — and they are still answering the next batch's questions.",
  },
];

const PROCESS = [
  {
    title: "Understand the student",
    text: "Academic history, English level, finances, family situation, and what you actually want to be doing in five years. Destinations come after this, never before.",
  },
  {
    title: "Build a realistic shortlist",
    text: "Three or four courses you can get into, afford and finish — with the aspirational option kept, and honestly labelled as such.",
  },
  {
    title: "Prepare properly",
    text: "Test preparation where a score is what stands in the way, and documentation assembled slowly enough to be right the first time.",
  },
  {
    title: "Apply and lodge",
    text: "Applications, offers, fee deposits, CoE or CAS, and a visa file built to be believed. You see every document before it is sent.",
  },
  {
    title: "Land well",
    text: "Pre-departure briefing, accommodation, the first month's checklist, and people already there who remember what week one felt like.",
  },
];

const CITY = [
  { src: "/about/kathmandu-1.jpg", caption: "Kathmandu — the city we work in" },
  { src: "/about/kathmandu-2.jpg", caption: "The street outside our door" },
  { src: "/about/kathmandu-3.jpg", caption: "Where most first conversations happen" },
];

/** Everything on this page that arrives on scroll. */
const REVEALS = ".who-work-card, .who-credo-card, .who-city-shot";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Who We Are | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  /* Cards arrive as they reach the viewport, then stop being watched —
     scrolling back up does not replay them. Same approach as the career and
     visa pages, so the whole site reveals at one rhythm.

     Collected by selector inside this page's own root rather than by a ref
     per card: three separate rows in three separate sections would otherwise
     need three ref arrays kept in order by hand, and the observer does not
     care which section a card came from. */
  useEffect(() => {
    const nodes = Array.from(
      root.current?.querySelectorAll<HTMLElement>(REVEALS) ?? []
    );
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
      revealInit(0.15, "-8%")
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <article className="dpage who" ref={root}>
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/about/hero.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <span className="svc-crumb">Lakehead Education</span>
            </p>
            {/* Three weights, three sizes, one family — the same device the
                career page uses, because this page is also an invitation
                rather than a form. */}
            <h1 className="who-title">
              <span className="who-thin">We are not in the business of</span>
              <span className="who-fat">sending students away.</span>
              <span className="who-accent">We are in the business of getting them there.</span>
            </h1>
            <p className="dpage-lead">
              Lakehead Education is a study abroad consultancy in Kathmandu.
              Counselling, admissions, test preparation and visa guidance under
              one roof — and one counsellor who stays with your file from the
              first conversation to your first week of term.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Free Expert Consultation →</Link>
              <a className="dpage-jump" href="#find-us">
                Come and see us <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ---- the short version ---- */}
      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <p className="dpage-eyebrow-sm">Who we are</p>
            <h2 className="dpage-title who-h2">
              A consultancy built around <span className="h-accent">one student at a time</span>
            </h2>
            <p className="dpage-section-lead">
              We have spent well over a decade helping Nepali students find
              their way into universities abroad, and in that time the thing we
              have become most sure of is that no two files are the same. An
              application is not paperwork to be processed. It is a decision
              about where somebody spends the next three years of their life
              and how their family pays for it.
            </p>
            <p>
              So we start with the student. Grades, English, budget, family
              circumstances, what you are genuinely good at and what you have
              been pretending to be good at. Only once that picture is honest
              do we start talking about destinations, courses, institutions and
              cost — which is why our recommendations tend to be shorter than
              other people&rsquo;s, and why they tend to hold up.
            </p>
            <p className="dpage-fineprint">
              We represent institutions across six destinations, teach every
              major English and admissions test in-house, and keep our
              counsellors certified and our advice on the record. No shortcuts,
              no guaranteed-visa promises, and no course you have never heard
              of at a college nobody can find.
            </p>
          </div>
          <aside className="dpage-callout">
            <h3>Start with a conversation</h3>
            <p>
              The first consultation is free, takes about an hour, and commits
              you to nothing at all. Most people leave it with a shorter list
              than they walked in with.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Book a consultation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      {/* ---- the figures ---- */}
      <section className="who-figures-band">
        <div className="container">
          <div className="who-figures">
            {FIGURES.map((f) => (
              <div className="who-figure" key={f.label}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- what we actually do ---- */}
      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title who-h2">
            What happens <span className="h-outline">under this roof</span>
          </h2>
          <p className="dpage-section-lead">
            Three departments, one building, and deliberately no handover
            between them. The counsellor who reads your transcript is the one
            who watches your score come back and the one who checks your visa
            file before it is lodged.
          </p>
          <div className="who-work">
            {WORK.map((w, i) => (
              <article
                className="who-work-card"
                key={w.title}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <figure className="who-work-shot">
                  <Shot src={w.image} alt="" />
                </figure>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- vision, mission, values, goal ---- */}
      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title who-h2">
            What we are <span className="h-accent">trying to do</span>
          </h2>
          <p className="dpage-section-lead">
            Four statements, kept short enough that everyone here can repeat
            them without reading them off a wall.
          </p>
          <div className="who-credo">
            {CREDO.map((c, i) => (
              <article
                className="who-credo-card"
                key={c.kicker}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="who-kicker">{c.kicker}</p>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- the pull quote: our objective, in three verbs ---- */}
      <section className="who-quote">
        <div className="container">
          <p>
            Grow by challenging <em>ourselves</em>. Sharpen against{" "}
            <em>our own</em> last year. Outrun <em>our own</em> expectations.
          </p>
          <span>
            Every other consultancy in this city is somebody else&rsquo;s
            benchmark. We have never found that a useful one.
          </span>
        </div>
      </section>

      {/* ---- what we will not bend on, and how a file moves ---- */}
      <section className="dpage-section">
        <div className="container dpage-split who-principles-split">
          <div>
            <h2 className="dpage-title who-h2">
              Six things we <span className="h-accent">will not bend on</span>
            </h2>
            <p className="dpage-section-lead">
              These are not slogans. They are the reasons a file occasionally
              takes longer here than it would elsewhere, and they are worth
              knowing before you choose who to work with.
            </p>
            <ol className="who-principles">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title}>
                  <span className="who-principle-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="who-process">
            <h3 className="dpage-sub">How a file moves</h3>
            <ol className="who-steps">
              {PROCESS.map((s, i) => (
                <li key={s.title}>
                  <span className="who-step-n" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ul className="dpage-checks who-promises">
              <li><span aria-hidden="true"><Check /></span>You see every document before it is sent</li>
              <li><span aria-hidden="true"><Check /></span>Nothing is submitted without your sign-off</li>
              <li><span aria-hidden="true"><Check /></span>Your counsellor&rsquo;s number, not a front desk</li>
            </ul>
          </aside>
        </div>
      </section>

      {/* ---- our home in Kathmandu ---- */}
      <section className="dpage-section dpage-tint who-place" id="find-us">
        <div className="container">
          <p className="dpage-eyebrow-sm">Our offices</p>
          <h2 className="dpage-title who-h2">
            Kathmandu, Birtamod <span className="h-outline">and Butwal</span>
          </h2>
          <p className="dpage-section-lead">
            The head office is in Kathmandu — counselling, classes,
            documentation and the people who sign off on a visa file, all in
            the same building. Birtamod covers the eastern districts and
            Butwal the west, and they are not postboxes: the same counsellors
            and the same file, closer to home. Whichever you walk into, nobody
            makes you explain your application twice.
          </p>

          <div className="who-city">
            {CITY.map((c, i) => (
              <figure
                className="who-city-shot"
                key={c.src}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <Shot src={c.src} alt="" />
                <figcaption>{c.caption}</figcaption>
              </figure>
            ))}
          </div>

          <div className="who-map-split">
            <div className="who-map">
              {/* The `output=embed` map needs no API key and no script. Lazy,
                  because it is the heaviest thing on the page and sits a long
                  way below the fold. */}
              <iframe
                src={contact.mapEmbed}
                title="Lakehead Education on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            {/* The head office only. The contact page carries the switcher
                for all three, so this panel stays one address rather than
                becoming a second, worse version of that. */}
            <div className="who-visit">
              <h3 className="dpage-sub">The head office</h3>
              <address className="who-address">
                <span className="who-address-pin" aria-hidden="true"><Pin /></span>
                <span className="who-address-lines">
                  {contact.addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              </address>
              <dl className="who-hours">
                {contact.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
              <div className="who-visit-links">
                <a
                  className="dpage-callout-btn who-map-btn"
                  href={contact.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps <Arrow />
                </a>
                <a className="who-visit-call" href={contact.phoneHref}>
                  {contact.phoneDisplay}
                </a>
              </div>
              <p className="dpage-fineprint">
                Walk-ins are fine, but an appointment means a counsellor is free
                the moment you arrive rather than an hour later.{" "}
                <Link to="/contact">Birtamod and Butwal are on the contact page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- contact ---- */}
      <section className="dpage-section who-contact" id="contact">
        <div className="container">
          <h2 className="dpage-title who-h2">
            Say hello, <span className="h-accent">and we will take it from there</span>
          </h2>
          <p className="dpage-section-lead">
            Tell us roughly where you are — a country in mind, a score you need,
            or nothing at all beyond wanting to go. A counsellor replies within
            one working day.
          </p>

          <div className="who-contact-split">
            <div className="who-form-panel">
              <InquiryForm
                className="form who-form"
                submitLabel="Send enquiry"
                submitClassName="who-submit"
              />
            </div>

            <aside className="who-contact-side">
              <h3>Or reach us directly</h3>
              <ul className="who-contact-list">
                <li>
                  <span>Call the office</span>
                  <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
                </li>
                <li>
                  <span>WhatsApp</span>
                  <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                    Message us
                  </a>
                </li>
                <li>
                  <span>Email</span>
                  <a href={contact.emailHref}>{contact.emailDisplay}</a>
                </li>
                <li>
                  <span>Visit</span>
                  <a href="#find-us">{contact.addressLines.slice(-2).join(", ")}</a>
                </li>
              </ul>
              <p className="dpage-fineprint">
                Nothing you send here goes any further than our counselling
                team. We do not pass enquiries to institutions until you have
                chosen one.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Not sure where to begin?</h2>
            <p>That is the most common way anyone starts. Come and talk it through.</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
