import { useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/client";
import type { ServiceType } from "../types/api";

/**
 * The shortest form on the site: a name, a number, and a button.
 *
 * ------------------------------------------------------------------
 * WHY IT ASKS FOR SO LITTLE. Every other form here wants an email address
 * and a paragraph, which is the right trade when somebody has already
 * decided to get in touch. This one is for the reader who is halfway down a
 * guide and has a question they cannot quite phrase — the kind of person who
 * closes a three-field form and does not come back. Two fields and a call
 * back is a smaller ask than writing the question down.
 *
 * It posts to the same `/inquiries` endpoint as everything else, with
 * `source: "callback"`, so it lands in the same admin list and the same
 * notification mail. That source is what tells the server not to expect an
 * email address or a message — see the model and validators, where both
 * stopped being unconditionally required for exactly this form.
 * ------------------------------------------------------------------
 *
 * IT IS NOT SHOWN WHERE A FULL FORM ALREADY IS. Two forms on one page split
 * the answer rather than doubling it, and the longer one collects more.
 */

interface Props {
  /**
   * Tags the enquiry so the admin can see what the reader was looking at.
   * A call-back from the visa guide is a different conversation from one off
   * the home page, and the counsellor should know which before dialling.
   */
  service?: ServiceType;
  /** Overrides for a page where the standing copy does not quite fit. */
  eyebrow?: string;
  heading?: string;
  /**
   * Straddle the edge of whatever is above it — 40% of the band on that
   * section, the rest on the white below. Used on the home page to sit the
   * band across the bottom of the hero film.
   *
   * WHY THIS IS MEASURED AND NOT A PERCENTAGE. The obvious spelling,
   * `margin-top: -40%`, is wrong: percentage margins resolve against the
   * containing block's WIDTH, so on a wide screen it would pull the band up
   * by hundreds of pixels and on a narrow one by almost none.
   * `translateY(-40%)` does resolve against the element's own height, but a
   * transform leaves the layout where it was, so everything below would keep
   * a band-shaped gap. Measuring gives an exact 40% that also moves the rest
   * of the page up with it.
   */
  overlap?: boolean;
}

type State = { kind: "idle" | "busy" | "done" | "error"; message: string };

/** How much of the band sits on the section above it. */
const OVERLAP = 0.4;

export default function CallbackStrip({
  service = "other",
  eyebrow = "Would rather just talk?",
  heading = "Leave your number and we will call you.",
  overlap = false,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<State>({ kind: "idle", message: "" });
  const box = useRef<HTMLDivElement>(null);
  const [lift, setLift] = useState(0);

  /* Re-measured whenever the box changes size — the copy reflows at every
     breakpoint and the form collapses to a stack on narrow screens, so a
     figure taken once on mount would be wrong for most of the page's life.

     LAYOUT effect, not a plain one: an ordinary effect runs after the browser
     has painted, so the band would appear in its unlifted position for a
     frame and then jump up onto the film. This measures and writes before
     that first paint. Safe here because the app is client-rendered — there
     is no server pass for this to warn about. */
  useLayoutEffect(() => {
    if (!overlap) return;
    const el = box.current;
    if (!el) return;
    const measure = () => setLift(el.offsetHeight * OVERLAP);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [overlap]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "busy") return;
    if (!name.trim() || !phone.trim()) return;

    setState({ kind: "busy", message: "" });
    try {
      const res = await api.post<{ message: string }>("/inquiries", {
        name: name.trim(),
        phone: phone.trim(),
        service,
        source: "callback",
      });
      setState({ kind: "done", message: res.data.message });
      setName("");
      setPhone("");
    } catch (err) {
      setState({ kind: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <section
      className="cbs"
      data-overlap={overlap || undefined}
      /* Zero until measured, so the band never jumps up from a guess. The
         stylesheet also drops the lift below the stacking breakpoint, where
         the hero is not held to the window's height and a band reaching up
         into it would cover the buttons. */
      style={{ "--cbs-lift": `${lift}px` } as CSSProperties}
    >
      {/* The container keeps the gutter; the box inside it carries the tint,
          so on a narrow screen the panel stops short of the edges instead of
          running into them. */}
      <div className="container">
        <div className="cbs-box" ref={box}>
          <div>
            <p className="cbs-eyebrow">{eyebrow}</p>
            <h2 className="cbs-head">{heading}</h2>
          </div>

          {/* The form is REPLACED by the acknowledgement rather than sitting
              emptied underneath it. A cleared form next to "thank you" reads
              as an invitation to send it again, and second submissions from
              the same person are most of what a form like this collects. */}
          {state.kind === "done" ? (
            <p className="cbs-done" role="status">
              {state.message}
            </p>
          ) : (
            <form className="cbs-form" onSubmit={submit}>
              <label className="cbs-field">
                <span className="sr-only">Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="cbs-field">
                <span className="sr-only">Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  autoComplete="tel"
                  /* `tel` rather than a pattern: numbers here arrive with
                     +977, with spaces, with dashes and without, and a regex
                     strict enough to be worth having rejects real people. */
                  required
                />
              </label>

              <button type="submit" disabled={state.kind === "busy"}>
                {state.kind === "busy" ? "Sending…" : "Send"}
              </button>

              {state.kind === "error" ? (
                <p className="cbs-error" role="alert">
                  {state.message}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
