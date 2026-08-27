import { Link } from "react-router-dom";

/**
 * "Get Ready To Begin Your Journey" — the large call-to-action band above
 * the footer: centred copy and a single Contact Us link.
 *
 * The button goes to /contact. It used to open the free-consultation form in
 * an overlay, which was the wrong answer to "Contact Us" twice over: the
 * contact page carries all three offices, the map and the enquiry form,
 * none of which fitted in a dialog — and a band whose whole job is to send
 * people somewhere was instead keeping them here.
 *
 * There is no photo column here any more — the band is centred copy and one
 * link. (An earlier version had a cut-out student photo bleeding over the
 * card's top edge, which is why you may still see cta-student.png mentioned
 * elsewhere; nothing reads that file today.)
 */
export default function ConsultBanner() {
  return (
    <section className="journey-cta">
      <div className="container journey-inner">
        <h2 className="journey-title">
          Get Ready To Begin{" "}
          <span className="h-outline">Your Journey</span>
        </h2>
        <p className="journey-lead">
          Explore more, stay informed, and start your journey to academic
          excellence.
        </p>
        <Link className="journey-btn" to="/contact">
          Contact Us
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
