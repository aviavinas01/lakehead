import { useState, type ChangeEvent } from "react";
import api, { getErrorMessage } from "../api/client";

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

/* 16px icons for the trust strip under the form */
const icon = {
  shield: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </svg>
  ),
  headset: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13a8 8 0 0116 0" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v1a2 2 0 01-2 2h-4" />
    </svg>
  ),
};

export default function ConsultCard() {
  const [form, setForm] = useState<ConsultForm>(initial);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
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
      <p className="consult-sub">Not sure where to start? Tell us a little about your plans, and our team will help you figure out the next step.</p>
      <div className="consult-form">
        <input
          name="name" placeholder="Full Name*" value={form.name}
          onChange={set} autoComplete="name"
        />
        <input
          type="email" name="email" placeholder="Email Address*" value={form.email}
          onChange={set} autoComplete="email"
        />
        <div className="consult-phone">
          <span className="consult-prefix">+977</span>
          <input
            type="tel" name="phone" placeholder="Mobile Number*" value={form.phone}
            onChange={set} autoComplete="tel-national"
          />
        </div>
        <select name="destination" value={form.destination} onChange={set} required>
          <option value="" disabled>Where do you want to study?*</option>
          {DESTINATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select name="year" value={form.year} onChange={set} required>
          <option value="" disabled>Which year do you want to start?*</option>
          {YEAR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select name="intake" value={form.intake} onChange={set} required>
          <option value="" disabled>When do you plan to start?*</option>
          {INTAKE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
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
          type="button" className="consult-submit" onClick={submit}
          disabled={status.state === "sending"}
        >
          {status.state === "sending" ? "Sending…" : "Start My FREE Consultation"}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        {status.message && (
          <p className={status.state === "error" ? "form-error" : "form-success"}>
            {status.message}
          </p>
        )}
      </div>
      <div className="consult-trust">
        <span>{icon.shield} Certified Counsellors</span>
        <span>{icon.lock} 100% Data Privacy</span>
        <span>{icon.headset} Free Guidance, No Hidden Fees</span>
      </div>
    </div>
  );
}
