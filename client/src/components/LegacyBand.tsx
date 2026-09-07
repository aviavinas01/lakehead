import { Link } from "react-router-dom";
import { Arrow } from "./destinationBits";

/**
 * Who we are, and how long we have been at it — the band between the hero
 * film and the figures.
 *
 * It sits there deliberately: the film says what we do, this says who is
 * doing it, and only then do the numbers mean anything.
 *
 * The copy is centred. It was centred originally to keep clear of a frosted
 * shape that straddled the hero above; that shape is gone, and centred is
 * still right for a block this short — three lines and a link do not need a
 * column to hang off.
 */

/**
 * TODO — CONFIRM BEFORE THIS GOES LIVE.
 *
 * This is the same figure the About page publishes ("14+ years of practice"),
 * and that page marks its whole set as placeholders shaped like the real
 * thing. It is a more prominent claim here than it is there — second block
 * on the home page — so it wants confirming with the office first, and the
 * two pages have to agree once it is.
 */
const YEARS = 14;

export default function LegacyBand() {
  return (
    <section className="legacy">
      <div className="container legacy-inner">
        <p className="legacy-eyebrow">Who we are</p>
        {/* Two weights in one line, which is the device the rest of the site
            uses for a headline that has a figure in it: the plain half sets
            the sentence up and the heavy half is the claim. */}
        <h2 className="legacy-title">
          Guiding Nepali students abroad{" "}
          <strong>for over {YEARS} years</strong>
        </h2>
        <p className="legacy-lead">
          Lakehead Education is a study abroad consultancy in Kathmandu.
          Counselling, admissions, test preparation and visa guidance under one
          roof — and one counsellor who stays with your file from the first
          conversation to your first week of term.
        </p>
        <Link className="legacy-link" to="/about">
          Our story <Arrow />
        </Link>
      </div>
    </section>
  );
}
