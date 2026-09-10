import { useState, type ChangeEvent, type FormEvent } from "react";
import api, { getErrorMessage } from "../../api/client";
import type { InquirySource, ServiceType } from "../../types/api";

/**
 * The enquiry form, in one place. It is asked for on the contact page and
 * again inside the Who We Are page's contact section, and both post the same
 * body to the same endpoint — so the fields, the validation and the status
 * handling live here rather than being kept in step by hand.
 *
 * Only the class names are handed in. The contact page passes nothing and
 * gets exactly the markup it had before; the about page wraps the same
 * fields in its own panel styling.
 */

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

interface Props {
  /** Class on the <form> itself. `.form` carries the shared field styling. */
  className?: string;
  submitLabel?: string;
  submitClassName?: string;
  /**
   * Which page this copy of the form is on. It is not a field the visitor
   * fills in — it rides along with the submission so the notification email
   * and the dashboard can say where an enquiry came from. Defaults to the
   * contact page, which is where this form has always lived.
   */
  source?: InquirySource;
}

export default function InquiryForm({
  className = "form",
  submitLabel = "Send inquiry",
  submitClassName = "btn btn-primary",
  source = "contact",
}: Props) {
  const [form, setForm] = useState<ContactForm>(initial);
  const [status, setStatus] = useState<Status>({ state: "idle", message: "" });

  const set = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  /* A real <form> submit, so the browser's own required-field checks run and
     Enter sends it — the button is a submit button rather than an onClick. */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const res = await api.post<{ message: string }>("/inquiries", { ...form, source });
      setStatus({ state: "success", message: res.data.message });
      setForm(initial);
    } catch (err) {
      setStatus({ state: "error", message: getErrorMessage(err) });
    }
  };

  /* `data-field` on each label so a stylesheet can lay these out without
     counting them. The alternative is `:nth-of-type(4)`, which silently
     means a different field the moment anyone reorders or adds one — and
     the layout that needs this most (the horizontal one, where `message`
     spans the full width) would break in a way nobody would attribute to
     the reorder. */
  return (
    <form className={className} onSubmit={submit} noValidate={false}>
      <label data-field="name">
        Full name
        <input name="name" value={form.name} onChange={set} required />
      </label>
      <label data-field="email">
        Email
        <input type="email" name="email" value={form.email} onChange={set} required />
      </label>
      <label data-field="phone">
        Phone (optional)
        <input name="phone" value={form.phone} onChange={set} />
      </label>
      <label data-field="service">
        Service
        <select name="service" value={form.service} onChange={set}>
          <option value="study-abroad">Study abroad counselling</option>
          <option value="test-preparation">Test preparation</option>
          <option value="visa-guidance">Visa guidance</option>
          <option value="career-counselling">Career counselling</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label data-field="message">
        Message
        <textarea name="message" rows={5} value={form.message} onChange={set} required />
      </label>
      <button className={submitClassName} type="submit" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending…" : submitLabel}
      </button>
      {status.message && (
        <p
          className={status.state === "error" ? "form-error" : "form-success"}
          role="status"
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
