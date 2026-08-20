import { useState, type ChangeEvent } from "react";
import api, { getErrorMessage } from "../api/client";
import type { ServiceType } from "../types/api";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  service: ServiceType;
  message: string;
}

const initial: ContactForm = {
  name: "",
  email: "",
  phone: "",
  service: "study-abroad",
  message: "",
};

type Status = { state: "idle" | "sending" | "success" | "error"; message: string };

export default function Contact() {
  const [form, setForm] = useState<ContactForm>(initial);
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });

  const set = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setStatus({ state: "sending", message: "" });
    try {
      const res = await api.post<{ message: string }>("/inquiries", form);
      setStatus({ state: "success", message: res.data.message });
      setForm(initial);
    } catch (err) {
      setStatus({ state: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <section className="section container contact">
      <h1>Get in touch</h1>
      <p>Fill out the form and our counsellors will reach out within 24 hours.</p>

      <div className="form">
        <label>
          Full name
          <input name="name" value={form.name} onChange={set} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={set} required />
        </label>
        <label>
          Phone (optional)
          <input name="phone" value={form.phone} onChange={set} />
        </label>
        <label>
          Service
          <select name="service" value={form.service} onChange={set}>
            <option value="study-abroad">Study abroad counselling</option>
            <option value="test-preparation">Test preparation</option>
            <option value="visa-guidance">Visa guidance</option>
            <option value="career-counselling">Career counselling</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Message
          <textarea name="message" rows={5} value={form.message} onChange={set} required />
        </label>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={status.state === "sending"}
        >
          {status.state === "sending" ? "Sending…" : "Send inquiry"}
        </button>
        {status.message && (
          <p className={status.state === "error" ? "form-error" : "form-success"}>
            {status.message}
          </p>
        )}
      </div>
    </section>
  );
}
