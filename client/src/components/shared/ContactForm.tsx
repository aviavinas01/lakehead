import { useState } from "react";
import InquiryForm from "./InquiryForm";
import type { InquirySource } from "../../types/api";

/**
 * "Drop us a line" — the enquiry form as a section, with an illustration
 * beside it.
 *
 * ------------------------------------------------------------------
 * IT WRAPS InquiryForm RATHER THAN REPLACING IT. The fields, the validation,
 * the posting and the success and error handling are all already there and
 * already used by two pages; a second form component would be a second copy
 * of that to keep in step, and the first thing to drift would be the one
 * thing that matters — which endpoint it posts to and what it sends.
 *
 * So this contributes layout and nothing else: a heading, an illustration,
 * and the class names that restyle the same fields. Every submission still
 * goes to POST /inquiries and lands in the admin inquiries list.
 * ------------------------------------------------------------------
 *
 * THE FIELDS ARE THE FULL FIVE, not the three in the reference design. Phone
 * is how most people here actually want to be reached, and `service` is what
 * the dashboard's demand panel counts — a form without it would file every
 * enquiry as "other" and quietly flatten that chart. Both stay optional to
 * fill in; only name, email and message are required.
 */

/**
 * Where the drawing lives. Save the illustration to this path — a PNG with a
 * transparent background sits best on the tint.
 *
 * A missing file collapses the column rather than showing a broken image, so
 * the section is perfectly usable before the artwork arrives.
 */
const ILLUSTRATION = "/illustrations/contact.png";

interface Props {
  /** Rides along with the submission so the admin can see which page it came
      from. Defaults to the contact page, where this form has always lived. */
  source?: InquirySource;
  /** Anchor target, for pages whose form section was linkable before. */
  id?: string;
  eyebrow?: string;
  heading?: string;
  lead?: string;
}

export default function ContactForm({
  source = "contact",
  id,
  eyebrow = "Contact us",
  heading = "Drop us a line",
  lead = "Tell us roughly where you are — a country in mind, a score you need, or nothing at all beyond wanting to go. A counsellor replies within one working day.",
}: Props) {
  const [artMissing, setArtMissing] = useState(false);

  return (
    <section className="cfm" id={id}>
      {/* The container holds the gutter and the box inside it carries the
          outline, so on a narrow screen the border stops short of the
          viewport edges instead of running into them. */}
      <div className="container">
        <div className="cfm-box" data-art={!artMissing || undefined}>
          <div className="cfm-copy">
            <p className="cfm-eyebrow">{eyebrow}</p>
            <h2 className="cfm-head">{heading}</h2>
            <p className="cfm-lead">{lead}</p>

            <InquiryForm
              className="cfm-form"
              submitLabel="Send message"
              submitClassName="cfm-go"
              source={source}
            />
          </div>

          {/* Decorative. The form beside it says everything this does, so a
              screen reader should walk straight past it. */}
          {artMissing ? null : (
            <div className="cfm-art" aria-hidden="true">
              <img
                src={ILLUSTRATION}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setArtMissing(true)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
