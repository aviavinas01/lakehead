import { useEffect, useRef, useState, type CSSProperties } from "react";
import ConsultCard from "./ConsultCard";

/**
 * "Your Journey to Global Education Starts Here" — beige full-width band
 * with the 4-step immigration journey on the left and the free-consultation
 * card on the right.
 *
 * The band pins: once it reaches the top of the screen the whole thing —
 * heading, steps and form — holds still while the page keeps scrolling,
 * and the steps take turns in the space beside the form, each rising into
 * place as the one before it slides up and away. Only after the last step
 * has had its turn does the band release and scroll off with the page.
 *
 * The steps carry no fill of their own, so the logo watermark behind them
 * is never covered — the outgoing step fades out instead of being hidden.
 *
 * A narrow or short window has no room to hold the whole band still — the
 * form alone runs about 640px. There the heading and the steps are held
 * together as one frame instead, on a track of their own, and the form
 * follows once the last step has landed. Same animation either way, so
 * both paths are measured below and only the source of the progress
 * differs. PIN_QUERY must stay in step with the media queries in
 * styles.css that pick between the two.
 */

/** Windows with the room to hold the whole band — heading, steps and form. */
const PIN_QUERY = "(min-width: 861px) and (min-height: 780px)";

/* `color` is the step's own accent — it carries both the number and the
   title, so each step arrives in a colour of its own. Add a step and give
   it one; without it the CSS falls back to the brand indigo. */
const STEPS: { title: string; text: string; color: string }[] = [
  {
    title: "Education Counseling",
    text: "Get personalized guidance to choose the right course, university, and destination based on your academic and career goals.",
    color: "#4f46e5",
  },
  {
    title: "University Applications",
    text: "We manage your applications end-to-end, so you can secure admission to top universities without the hassle.",
    color: "#e0234e",
  },
  {
    title: "Loans & Scholarships",
    text: "Explore financial options with our loan and scholarship expertise, making your dream education affordable.",
    color: "#0d9488",
  },
  {
    title: "Visa Processing",
    text: "Apply for your visa with the help of our visa experts. Our team has a 99% visa success rate.",
    color: "#ea580c",
  },
];

export default function NextSteps() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  /* Which step is showing is a function of how far the page has scrolled
     through whatever is being held. Reads happen on an animation frame, so
     a burst of scroll events still measures the page only once. */
  useEffect(() => {
    const wide = window.matchMedia(PIN_QUERY);
    let raf = 0;

    /* The whole band is held: the section stands a screen tall plus one
       stretch of scroll per step, and the steps divide that stretch. */
    const bandProgress = () => {
      const el = section.current;
      if (!el) return null;
      const { top, height } = el.getBoundingClientRect();
      const travel = height - window.innerHeight;
      if (travel <= 0) return null;
      return -top / travel;
    };

    /* Only the heading and steps are held, as one frame, with an empty
       spacer below them for it to be held over. The frame is the first
       thing in the track, so the two share a top edge until the frame
       sticks — which makes how far the track's top has travelled past the
       sticky offset the whole measurement. What is left of the track once
       the frame's own height is taken off is the spacer, and that is the
       distance to run. Read off the track rather than the frame on
       purpose: it stays true whether or not the frame is actually stuck,
       instead of snapping between the ends when it is not. */
    const frameProgress = () => {
      const outer = track.current;
      const held = frame.current;
      if (!outer || !held) return null;
      const outerRect = outer.getBoundingClientRect();
      const travel = outerRect.height - held.getBoundingClientRect().height;
      if (travel <= 0) return null;
      const pinnedAt = parseFloat(getComputedStyle(held).top) || 0;
      return (pinnedAt - outerRect.top) / travel;
    };

    const measure = () => {
      raf = 0;
      const progress = wide.matches ? bandProgress() : frameProgress();
      if (progress === null) return;
      const eased = Math.min(Math.max(progress, 0), 1);
      setCurrent(Math.min(STEPS.length - 1, Math.floor(eased * STEPS.length)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    wide.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      wide.removeEventListener("change", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="next-steps"
      ref={section}
      style={{ "--steps": STEPS.length } as CSSProperties}
    >
      {/* Big logo watermark behind the form. The inner element is sticky so
          the mark holds its place behind the card as the section scrolls. */}
      <div className="next-steps-logo" aria-hidden="true">
        <span />
      </div>
      <div className="container next-steps-inner">
        <div className="next-steps-copy" ref={track}>
          {/* Heading and steps are one block, so a small screen holds them
              together rather than letting the heading scroll off. */}
          <div className="next-steps-frame" ref={frame}>
            <h2>Your Journey to Global Education Starts Here</h2>
            <p className="next-steps-lead">
              Explore international opportunities, gain valuable experience, and build a stronger future through studying abroad.
            </p>
            <div className="steps-stage">
              {STEPS.map((s, i) => (
                <div
                  className={`step-card${
                    i === current ? " is-current" : i < current ? " is-past" : ""
                  }`}
                  key={s.title}
                  style={{ "--step-color": s.color } as CSSProperties}
                >
                  <div className="step-head">
                    <span className="step-num">{i + 1}</span>
                    <h3>{s.title}</h3>
                  </div>
                  <p className="step-body">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* The room the frame is held over. It has to be a box in the
              flow, not padding on the track: a sticky element is held
              within its containing block's CONTENT box, and padding is
              not part of that — as padding it gave the frame no slack at
              all and it simply scrolled away. */}
          <div className="next-steps-room" aria-hidden="true" />
        </div>

        <ConsultCard />
      </div>
    </section>
  );
}
