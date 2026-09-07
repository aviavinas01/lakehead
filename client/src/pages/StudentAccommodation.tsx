import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { revealInit } from "../lib/reveal";
import HelpVideo from "../components/HelpVideo";

/**
 * Student Accommodation — /services/student-accommodation. A static route,
 * so it takes over from the generic service page.
 *
 * Laid out in three groups rather than one long list of twelve features:
 * the housing itself, the money, and everything around the move. Twelve
 * equal cards would read as a spec sheet; grouped, it reads as an argument.
 *
 * The four housing cards reveal as they reach the viewport. The two lists
 * below them do not — they are short, and animating everything on a page is
 * how a nice effect turns into a tic.
 */

const HOUSING = [
  {
    title: "Booked before you depart",
    text: "We arrange your accommodation ahead of time, so you leave Nepal already knowing where you are going to sleep. It takes the last-minute panic out of the move and secures somewhere close to your university while there is still something close to your university left.",
    image: "/services/accommodation/early.jpg",
  },
  {
    title: "Verified, and actually safe",
    text: "Every option is checked against safety and quality standards before we put it in front of you. Expect the things that make a place liveable rather than merely available — Wi-Fi, security, laundry, and somewhere you would genuinely want to come home to.",
    image: "/services/accommodation/verified.jpg",
  },
  {
    title: "Short stay or long lease",
    text: "Housing chosen around the length of your course and what you actually need. A four-week stay while you find your feet, or a full lease from day one — the flexibility matters most in the first weeks, when you are learning a new city and a new timetable at the same time.",
    image: "/services/accommodation/flexible.jpg",
  },
  {
    title: "Shared or private, with meals",
    text: "Shared apartments if the budget is tight, private rooms if you would rather have your own door. Meal plans are available either way, which makes the first month considerably easier when everything else is unfamiliar.",
    image: "/services/accommodation/shared.jpg",
  },
];

const MONEY = [
  {
    title: "Early booking rates",
    text: "Booking early usually means a lower rate, which comes straight off your living costs for the year.",
  },
  {
    title: "Refunds if your visa is refused",
    text: "Many providers offer a full refund where a visa application is refused. We will tell you which ones do — and on what terms — before you commit any money.",
  },
  {
    title: "Payment and paperwork handled",
    text: "We take you through the payment process safely and make sure the documentation is completed properly and in line with the housing standards of the country you are moving to.",
  },
  {
    title: "Rates through us",
    text: "Our arrangements with housing providers open up rates that are not on the public price list, which often brings a better class of building within reach.",
  },
];

const MOVE = [
  {
    title: "Before you fly, and after you land",
    text: "Advice before departure and help once you arrive — checking in, settling in, and the small things that feel enormous in your first week somewhere new.",
  },
  {
    title: "Luggage storage on arrival",
    text: "Arriving before your move-in date is common and awkward. Temporary storage means your travel dates do not have to bend around your tenancy start.",
  },
  {
    title: "One process, start to finish",
    text: "From choosing a place to moving into it, handled in one sequence rather than passed between people. Fewer places for something to be dropped.",
  },
];

const AMENITIES = [
  "Fitness centres",
  "Shuttle bus services",
  "Social events",
  "Sporting activities",
  "Study spaces",
  "On-site laundry",
  "24-hour security",
  "High-speed Wi-Fi",
];

export default function StudentAccommodation() {
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Student Accommodation | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const nodes = cards.current.filter((n): n is HTMLDivElement => !!n);
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
      revealInit(0.2, "-8%")
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <article className="dpage dpage-ruled acc">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/services/accommodation.jpg" alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services">Student Services</Link>
            </p>
            <h1>
              Somewhere to live,{" "}
              <span className="h-accent">sorted before you fly</span>
            </h1>
            <p className="dpage-lead">
              Arriving in a new country without a confirmed address is a bad
              way to start, and looking for a room in a city you have never
              been to — in your first week of term — is the hardest way to do
              it. So we sort it beforehand.
            </p>
            <p>
              Verified housing near your university, chosen around your course
              length and your budget, with the payment and paperwork handled
              properly. You land knowing exactly where you are going.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Free Expert Consultation →</Link>
              <a className="dpage-jump" href="#housing">
                What we arrange <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section" id="housing">
        <div className="container">
          <h2 className="dpage-title">
            The housing <span className="h-outline">itself</span>
          </h2>
          <p className="dpage-section-lead">
            What you are choosing between, and what we check before it reaches
            your shortlist.
          </p>
          <div className="acc-grid">
            {HOUSING.map((h, i) => (
              <div
                className="acc-card"
                key={h.title}
                ref={(el) => {
                  cards.current[i] = el;
                }}
              >
                <div className="acc-card-shot">
                  <Shot src={h.image} alt="" />
                </div>
                <div className="acc-card-body">
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container acc-two">
          <div>
            <h2 className="dpage-title">
              The <span className="h-accent">money</span> side
            </h2>
            <ol className="acc-list">
              {MONEY.map((m, i) => (
                <li key={m.title}>
                  <span className="acc-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="dpage-title">
              Around the <span className="h-accent">move</span>
            </h2>
            <ol className="acc-list">
              {MOVE.map((m, i) => (
                <li key={m.title}>
                  <span className="acc-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              What the buildings{" "}
              <span className="h-accent">come with</span>
            </h2>
            <p className="dpage-section-lead">
              Many of the properties we work with run well beyond a room and a
              kitchen. These are the sort of facilities worth asking about —
              the organised activities in particular, because they are how
              most students end up with a social circle rather than a
              timetable.
            </p>
            <ul className="dpage-fields dpage-fields-sm">
              {AMENITIES.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="dpage-fineprint">
              Facilities vary by property and by city. We will tell you what a
              specific building actually has rather than what the category
              usually includes.
            </p>
          </div>
          <aside className="dpage-callout">
            <h3>Start before the good ones go</h3>
            <p>
              Housing near a university is the thing that runs out first, and
              it runs out earlier every year. Tell us your intake and we will
              tell you when you need to move.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Book a consultation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            How it <span className="h-outline">runs</span>
          </h2>
          <ul className="dpage-checks dpage-checks-2">
            <li><span aria-hidden="true"><Check /></span>You tell us your university, your intake and your budget</li>
            <li><span aria-hidden="true"><Check /></span>We shortlist verified options that fit all three</li>
            <li><span aria-hidden="true"><Check /></span>You choose, and we handle the booking and the paperwork</li>
            <li><span aria-hidden="true"><Check /></span>We confirm the refund terms before any money moves</li>
            <li><span aria-hidden="true"><Check /></span>You travel with a confirmed address in hand</li>
            <li><span aria-hidden="true"><Check /></span>We stay reachable through check-in and the first few weeks</li>
          </ul>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Know where you are going</h2>
            <p>
              Tell us where you have been accepted and we will start looking.
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
