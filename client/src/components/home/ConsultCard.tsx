import { useState, type ChangeEvent, type FormEvent } from "react";
import api, { getErrorMessage } from "../../api/client";

/**
 * White free-consultation form card, used in the "Next Steps" band and in
 * the booking modal opened from the consultation banner. Posts to the same
 * /inquiries endpoint as the Contact page; the three dropdown answers are
 * folded into the inquiry message.
 */

const DESTINATION_OPTIONS = [
  "USA", "UK", "Australia", "Canada", "New Zealand", "South Korea", "Ireland", "Dubai",
];
const YEAR_OPTIONS = ["2026", "2027", "2028"];
const INTAKE_OPTIONS = [
  "As soon as possible", "January – April", "May – August", "September – December",
];

interface ConsultForm {
  name: string;
  email: string;
  phone: string;
  destination: string;
  year: string;
  intake: string;
}

const initial: ConsultForm = {
  name: "", email: "", phone: "", destination: "", year: "", intake: "",
};

type Status = { state: "idle" | "sending" | "success" | "error"; message: string };

export default function ConsultCard() {
  const [form, setForm] = useState<ConsultForm>(initial);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* A real submit handler on a real <form>: Enter sends it from any field,
     the browser runs its own required-field and email checks first, and the
     button is a submit button rather than something that happens to be
     wired to a click. The checks below still run — they are the backstop
     for the agreement box, which the browser cannot speak for. */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.destination || !form.year || !form.intake) {
      setStatus({ state: "error", message: "Please fill in all the fields." });
      return;
    }
    if (!agreed) {
      setStatus({ state: "error", message: "Please agree to the Privacy Policy and Terms & Conditions." });
      return;
    }
    setStatus({ state: "sending", message: "" });
    try {
      const res = await api.post<{ message: string }>("/inquiries", {
        name: form.name,
        email: form.email,
        phone: `+977 ${form.phone}`,
        service: "study-abroad",
        source: "consultation",
        message: `Free consultation request — Destination: ${form.destination}; Start year: ${form.year}; Planned intake: ${form.intake}.`,
      });
      setStatus({ state: "success", message: res.data.message });
      setForm(initial);
      setAgreed(false);
    } catch (err) {
      setStatus({ state: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <div className="consult-card">
      <div className="consult-intro">
        <h3>Book your free consultation</h3>
        <p className="consult-sub">
          Tell us a little about your plans and a counsellor will come back to
          you within one working day. It is free, and it commits you to
          nothing.
        </p>
      </div>
      {/* Every field is labelled, visibly, above the box.

          The form used to run on placeholders alone. A placeholder is not a
          label twice over: it is not reliably announced, and it disappears
          the moment somebody starts typing — so anyone who looks away
          mid-form comes back to six identical boxes. Real labels also give
          the two-column layout below something to align to. */}
      <form className="consult-form" onSubmit={submit}>
        <label className="consult-field">
          <span>Full name*</span>
          <input
            name="name" value={form.name} onChange={set}
            autoComplete="name" placeholder="As it appears on your passport"
            required
          />
        </label>

        <label className="consult-field">
          <span>Email address*</span>
          <input
            type="email" name="email" value={form.email} onChange={set}
            autoComplete="email" placeholder="you@example.com"
            required
          />
        </label>

        {/* The country code is a fixed prefix rather than a field: every
            number we take is Nepali, and a country picker for one country is
            a control that can only be got wrong. */}
        <label className="consult-field">
          <span>Mobile number*</span>
          <span className="consult-phone">
            <span className="consult-prefix" aria-hidden="true">+977</span>
            <input
              type="tel" name="phone" value={form.phone} onChange={set}
              autoComplete="tel-national" placeholder="98XXXXXXXX"
              aria-describedby="consult-cc"
              required
            />
          </span>
          <span id="consult-cc" className="consult-hint">
            Nepal, country code +977
          </span>
        </label>

        <label className="consult-field">
          <span>Where do you want to study?*</span>
          <select name="destination" value={form.destination} onChange={set} required>
            <option value="" disabled>Select a destination</option>
            {DESTINATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>

        <label className="consult-field">
          <span>Which year do you want to start?*</span>
          <select name="year" value={form.year} onChange={set} required>
            <option value="" disabled>Select a year</option>
            {YEAR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>

        <label className="consult-field">
          <span>When do you plan to start?*</span>
          <select name="intake" value={form.intake} onChange={set} required>
            <option value="" disabled>Select an intake</option>
            {INTAKE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>

        <label className="consult-agree">
          <input
            type="checkbox" checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I agree to Lakehead&rsquo;s <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Terms &amp; Conditions</a> *
          </span>
        </label>
        <button
          type="submit" className="consult-submit"
          disabled={status.state === "sending"}
        >
          <span>
            {status.state === "sending"
              ? "Sending…"
              : "Book my free consultation"}
          </span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </button>
        {/* Always in the tree, so a screen reader is already watching it when
            the message arrives — a live region added at the same moment as
            its own content is not reliably announced. */}
        <p
          className={status.state === "error" ? "form-error" : "form-success"}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      </form>
    </div>
  );
}
