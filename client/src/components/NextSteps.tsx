import ConsultCard from "./ConsultCard";

/**
 * "Your Journey to Global Education Starts Here" — beige full-width band
 * with the 4-step immigration journey on the left and the free-consultation
 * card on the right.
 *
 * The step cards use sticky stacking: as the page scrolls through this
 * section each card pins below the header and the next card slides up and
 * overlaps it, so the cards "scroll instead of the page"; once all four are
 * stacked, normal page scrolling continues. The form column is sticky too,
 * so it stays in place while the cards stack.
 */

/* Sticky offsets: where each card pins, below the ~100px sticky header.
   Each card pins STEP_GAP lower than the previous one so a strip of every
   earlier card (its number + title) stays visible, as in the design. */
const STEP_TOP = 110;
const STEP_GAP = 62;

const STEPS: { title: string; text: string }[] = [
  {
    title: "Education Counseling",
    text: "Get personalized guidance to choose the right course, university, and destination based on your academic and career goals.",
  },
  {
    title: "University Applications",
    text: "We manage your applications end-to-end, so you can secure admission to top universities without the hassle.",
  },
  {
    title: "Loans & Scholarships",
    text: "Explore financial options with our loan and scholarship expertise, making your dream education affordable.",
  },
  {
    title: "Visa Processing",
    text: "Apply for your visa with the help of our visa experts. Our team has a 99% visa success rate.",
  },
];

export default function NextSteps() {
  return (
    <section className="next-steps">
      {/* Big logo watermark behind the form. The inner element is sticky so
          the mark holds its place behind the card while the step cards
          stack, then scrolls away with the section. */}
      <div className="next-steps-logo" aria-hidden="true">
        <span />
      </div>
      <div className="container next-steps-inner">
        <div>
          <h2>Your Journey to Global Education Starts Here</h2>
          <p className="next-steps-lead">
            Explore international opportunities, gain valuable experience, and build a stronger future through studying abroad.
          </p>
          <div className="steps-stack">
            {STEPS.map((s, i) => (
              <div
                className="step-card"
                key={s.title}
                style={{ top: `${STEP_TOP + i * STEP_GAP}px` }}
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

        <ConsultCard />
      </div>
    </section>
  );
}
