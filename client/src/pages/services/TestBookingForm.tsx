import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { PlaneIcon } from "../../components/home/HeroOrbit";
import { Arrow, Shot } from "../../components/shared/destinationBits";
import { getErrorMessage } from "../../api/client";
import { submitTestBooking, type TestModule } from "../../api/testBookings";
import {
  CITY_SUGGESTIONS,
  MODULES,
  PROVIDER_LIST,
  SIGNATURE_MAX_BYTES,
  SIGNATURE_TYPES,
  bookingPath,
  findProvider,
  moduleLabel,
} from "../../data/testBooking";

/**
 * An IELTS booking form — /services/test-booking/idp and
 * /services/test-booking/british-council.
 *
 * ------------------------------------------------------------------
 * THE PAPER FORM, AS A WEB FORM. Each provider asks candidates to sign a
 * one-sentence declaration: "I ___, holder of passport number ___, intend to
 * take the IELTS exam on ___ regarding venue ___ and test module ___". The
 * inputs here are ordinary labelled fields, one to a line, because a
 * sentence with boxes inside it breaks apart badly on a phone. The sentence
 * itself is kept — it is drawn beside the form (above the submit button on
 * a phone) and fills itself in as they type, so what they submit still
 * reads as the declaration they are signing.
 *
 * THE SIGNATURE IS AN IMAGE THEY ATTACH, under 2 MB. It is checked here for
 * type and size before anything is sent, so the common mistake — a phone
 * photo at full resolution — is caught with a sentence rather than an upload
 * that fails at the end. The server checks all of it again and is the only
 * authority.
 *
 * THE DATE OF SIGNATURE IS NOT A FIELD. It is the day they submit, which the
 * server records itself. A field would only have been a chance to get it
 * wrong.
 *
 * SERVER ERRORS LAND ON THEIR FIELD. The API answers a rejected form with
 * one message per field; those are mapped back onto the inputs they belong
 * to and the first one is focused, rather than being shown as a single
 * "Validation failed" at the bottom of a long form.
 * ------------------------------------------------------------------
 */

type Field =
  | "fullName"
  | "passportNumber"
  | "examDate"
  | "testCity"
  | "module"
  | "signature"
  | "email"
  | "alternateEmail"
  | "phone"
  | "confirm";

/** The order errors are checked in for focus — top of the page first. */
const FIELD_ORDER: Field[] = [
  "fullName",
  "passportNumber",
  "examDate",
  "testCity",
  "module",
  "signature",
  "email",
  "alternateEmail",
  "phone",
  "confirm",
];

interface Values {
  fullName: string;
  passportNumber: string;
  examDate: string;
  testCity: string;
  module: TestModule | "";
  email: string;
  alternateEmail: string;
  phone: string;
  confirm: boolean;
}

const EMPTY: Values = {
  fullName: "",
  passportNumber: "",
  examDate: "",
  testCity: "",
  module: "",
  email: "",
  alternateEmail: "",
  phone: "",
  confirm: false,
};

/** "YYYY-MM-DD" in the visitor's own calendar — what <input type=date> uses. */
const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const longDay = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);

/** A picked "YYYY-MM-DD", read as the calendar day it names. */
const pickedDay = (v: string) => {
  const [y, m, d] = v.split("-").map(Number);
  return y && m && d ? longDay(new Date(y, m - 1, d)) : "";
};

const fieldId = (f: Field) => `tbk-${f}`;
const errorId = (f: Field) => `tbk-${f}-err`;
const hintId = (f: Field) => `tbk-${f}-hint`;

export default function TestBookingForm() {
  const { provider: slug } = useParams();
  const provider = findProvider(slug);

  const [values, setValues] = useState<Values>(EMPTY);
  const [signature, setSignature] = useState<{ file: File; url: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ message: string; summary: Values } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);

  /* Computed once per visit: "today" does not need to move while the form
     is open, and recomputing it per render would change the date input's
     `min` under the visitor's cursor at midnight. */
  const [today] = useState(() => new Date());
  const minDay = localDay(today);
  const maxDay = localDay(new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()));

  useEffect(() => {
    if (!provider) return;
    const previous = document.title;
    document.title = `${provider.name} booking | Lakehead Education`;
    return () => {
      document.title = previous;
    };
  }, [provider]);

  /* The preview is an object URL, which holds the image in memory until it
     is revoked — on replacement, and when the page goes away. */
  useEffect(() => {
    return () => {
      if (signature) URL.revokeObjectURL(signature.url);
    };
  }, [signature]);

  /* After a successful send, move focus to the confirmation so a screen
     reader announces it and a keyboard user is not left on a button that no
     longer exists — and bring it into view. NOT a scroll to the top of the
     page, which is what this used to do: the page now opens with a
     photograph hero, and the top of it is the picture, not the answer. */
  useEffect(() => {
    const heading = doneHeading.current;
    if (!done || !heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [done]);

  if (!provider) return <Navigate to="/services/test-booking" replace />;

  const clearError = (f: Field) =>
    setErrors((prev) => {
      if (!prev[f]) return prev;
      const next = { ...prev };
      delete next[f];
      return next;
    });

  const set = (f: Exclude<Field, "signature" | "confirm" | "module">) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = f === "passportNumber" ? e.target.value.toUpperCase() : e.target.value;
      setValues((prev) => ({ ...prev, [f]: v }));
      clearError(f);
    };

  const pickSignature = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    clearError("signature");
    if (!file) return;

    let problem = "";
    if (!SIGNATURE_TYPES.includes(file.type)) {
      problem = "Choose a JPG, PNG or WebP image of your signature.";
    } else if (file.size > SIGNATURE_MAX_BYTES) {
      problem = `That image is ${(file.size / (1024 * 1024)).toFixed(1)} MB — it needs to be under 2 MB. Crop it to just the signature, or take the photo at a lower resolution.`;
    }

    if (problem) {
      setErrors((prev) => ({ ...prev, signature: problem }));
      /* Cleared, so picking the same file again after fixing it still fires
         a change event. */
      e.target.value = "";
      return;
    }
    setSignature({ file, url: URL.createObjectURL(file) });
  };

  const removeSignature = () => {
    setSignature(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const focusFirst = (found: Partial<Record<Field, string>>) => {
    const first = FIELD_ORDER.find((f) => found[f]);
    if (!first) return;
    /* After the error has rendered, so the field's description is in place
       when a screen reader lands on it. */
    requestAnimationFrame(() => {
      const el =
        first === "module"
          ? document.querySelector<HTMLInputElement>(`input[name="module"]`)
          : document.getElementById(fieldId(first));
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setFormError("");

    /* The browser has already checked the required text fields. These three
       it cannot check: the file lives in state, not in the input, and the
       radio group and checkbox get a sentence rather than a tooltip. */
    const local: Partial<Record<Field, string>> = {};
    if (!values.module) local.module = "Choose Academic or General Training.";
    if (!signature) local.signature = "Attach an image of your signature.";
    if (!values.confirm) local.confirm = "Please confirm your details match your passport.";
    if (Object.keys(local).length) {
      setErrors((prev) => ({ ...prev, ...local }));
      focusFirst(local);
      return;
    }

    const form = new FormData();
    form.append("provider", provider.slug);
    form.append("fullName", values.fullName.trim());
    form.append("passportNumber", values.passportNumber.trim());
    form.append("examDate", values.examDate);
    form.append("testCity", values.testCity.trim());
    form.append("module", values.module);
    form.append("email", values.email.trim());
    if (provider.alternateEmail && values.alternateEmail.trim()) {
      form.append("alternateEmail", values.alternateEmail.trim());
    }
    form.append("phone", values.phone.trim());
    form.append("confirm", "true");
    /* Last, after every text field. multer reads the body in order, and the
       server validates the text before it keeps the image. */
    form.append("signature", signature!.file);

    setSending(true);
    try {
      const res = await submitTestBooking(form);
      setDone({ message: res.message, summary: values });
      setValues(EMPTY);
      removeSignature();
    } catch (err) {
      const data = err instanceof AxiosError ? err.response?.data : undefined;
      const list = (data?.errors as Array<{ path: string; message: string }> | undefined) ?? [];
      const found: Partial<Record<Field, string>> = {};
      for (const issue of list) {
        /* The API names fields "body.examDate"; the last segment is ours. */
        const f = issue.path.split(".").pop() as Field;
        if (FIELD_ORDER.includes(f) && !found[f]) found[f] = issue.message;
      }
      /* The image is refused without an errors list — size, type, or bytes
         that are not what they claim — and every one of those messages says
         "signature" or "image" or "file". */
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      const message = getErrorMessage(err, "Your request could not be sent. Please try again.");
      if (!list.length && (status === 413 || /signature|image|file/i.test(message))) {
        found.signature = message;
      }

      if (Object.keys(found).length) {
        setErrors((prev) => ({ ...prev, ...found }));
        focusFirst(found);
      } else {
        setFormError(message);
      }
    } finally {
      setSending(false);
    }
  };

  /** Props shared by every text input: its label wiring and error state. */
  const a11y = (f: Field, hasHint = true) => ({
    id: fieldId(f),
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby":
      [hasHint ? hintId(f) : "", errors[f] ? errorId(f) : ""].filter(Boolean).join(" ") || undefined,
  });

  /* Plain functions, not components: a component declared inside render is
     a new type every render, so React would unmount and remount it on each
     keystroke. */
  const errorLine = (f: Field) =>
    errors[f] ? (
      <p className="tbk-error" id={errorId(f)}>
        {errors[f]}
      </p>
    ) : null;

  /* The declaration, filled in as far as they have got. A blank shows as a
     dotted gap, the way it does on paper. */
  const blank = (v: string) =>
    v ? <strong>{v}</strong> : <span className="tbk-blank" aria-hidden="true" />;

  const other = PROVIDER_LIST.find((p) => p.slug !== provider.slug)!;

  return (
    <article className="dpage dpage-ruled tbk-page">
      {/* The same photographic hero every other page opens with, so the
          form reads as part of the site rather than a page bolted on. The
          photograph is the provider's own — see data/testBooking.ts for
          where to drop it. Until it exists the hero shows the navy field all
          heroes fall back to, which keeps the white heading readable.

          Shorter than a normal hero (see .tbk-hero): the thing this page is
          for is below it, and on a phone a full-height picture would push
          the first field off the screen. The first button jumps straight
          there. */}
      <header className="dpage-hero tbk-hero">
        <div className="dpage-hero-bg">
          <Shot src={provider.image} alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services/test-booking">Test Booking</Link>
            </p>
            <h1>{provider.name} booking</h1>
            <p className="dpage-lead">
              Fill this in exactly as your passport reads. A counsellor will be
              in touch within 24 hours to confirm the date, the fee and your
              seat.
            </p>
            <div className="dpage-hero-actions">
              <a className="btn btn-outline" href="#tbk-form">Fill in the form ↓</a>
              <Link className="dpage-jump" to={bookingPath(other.slug)}>
                Use the {other.name} form instead <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="tbk-body" id="tbk-form">
        <div className="container">
          {done ? (
            <div className="tbk-done" role="status">
              <span className="tbk-done-mark" aria-hidden="true">✓</span>
              <h2 ref={doneHeading} tabIndex={-1}>Request received</h2>
              <p>{done.message}</p>
              <dl className="tbk-done-summary">
                <div><dt>Test</dt><dd>{provider.name}</dd></div>
                <div><dt>Exam date</dt><dd>{pickedDay(done.summary.examDate)}</dd></div>
                <div><dt>Test city</dt><dd>{done.summary.testCity}</dd></div>
                <div>
                  <dt>Module</dt>
                  <dd>{done.summary.module ? moduleLabel(done.summary.module) : ""}</dd>
                </div>
              </dl>
              <p className="tbk-note">
                <strong>This is a request, not a confirmed booking.</strong> Your
                seat is held once a counsellor has registered you with the test
                provider and the fee is paid. A copy of this is on its way to{" "}
                {done.summary.email}.
              </p>
              <div className="tbk-done-actions">
                <Link className="btn btn-outline" to="/services/test-booking">
                  Back to Test Booking
                </Link>
                <Link className="tbk-link" to="/contact">
                  Talk to a counsellor <Arrow />
                </Link>
              </div>
            </div>
          ) : (
            <form className="tbk-form" onSubmit={submit} noValidate={false}>
              <div className="tbk-fields">
                <div className="tbk-field">
                  <label htmlFor={fieldId("fullName")}>Full name (as in passport)</label>
                  <input
                    {...a11y("fullName")}
                    name="fullName"
                    value={values.fullName}
                    onChange={set("fullName")}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                  <p className="tbk-hint" id={hintId("fullName")}>
                    Exactly as printed in your passport, including any middle names.
                  </p>
                  {errorLine("fullName")}
                </div>

                <div className="tbk-field">
                  <label htmlFor={fieldId("passportNumber")}>Passport number</label>
                  <input
                    {...a11y("passportNumber")}
                    name="passportNumber"
                    value={values.passportNumber}
                    onChange={set("passportNumber")}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={20}
                    required
                  />
                  <p className="tbk-hint" id={hintId("passportNumber")}>
                    As shown on the photo page.
                  </p>
                  {errorLine("passportNumber")}
                </div>

                <div className="tbk-row">
                  <div className="tbk-field">
                    <label htmlFor={fieldId("examDate")}>Exam date</label>
                    <input
                      {...a11y("examDate")}
                      type="date"
                      name="examDate"
                      value={values.examDate}
                      onChange={set("examDate")}
                      min={minDay}
                      max={maxDay}
                      required
                    />
                    <p className="tbk-hint" id={hintId("examDate")}>
                      The date you want. We&rsquo;ll confirm it&rsquo;s available.
                    </p>
                    {errorLine("examDate")}
                  </div>

                  <div className="tbk-field">
                    <label htmlFor={fieldId("testCity")}>Test city</label>
                    <input
                      {...a11y("testCity")}
                      name="testCity"
                      value={values.testCity}
                      onChange={set("testCity")}
                      list="tbk-cities"
                      autoComplete="address-level2"
                      maxLength={60}
                      required
                    />
                    <datalist id="tbk-cities">
                      {CITY_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <p className="tbk-hint" id={hintId("testCity")}>
                      The city you want to sit the test in.
                    </p>
                    {errorLine("testCity")}
                  </div>
                </div>

                <fieldset
                  className="tbk-field tbk-radios"
                  aria-describedby={errors.module ? errorId("module") : undefined}
                >
                  <legend>Test module</legend>
                  {MODULES.map((m) => (
                    <label className="tbk-radio" key={m.value}>
                      <input
                        type="radio"
                        name="module"
                        value={m.value}
                        checked={values.module === m.value}
                        onChange={() => {
                          setValues((prev) => ({ ...prev, module: m.value }));
                          clearError("module");
                        }}
                      />
                      <span>
                        <strong>{m.label}</strong>
                        <em>{m.hint}</em>
                      </span>
                    </label>
                  ))}
                  {errorLine("module")}
                </fieldset>

                <div className="tbk-field">
                  <span className="tbk-label" id="tbk-signature-label">Signature of candidate</span>
                  {signature ? (
                    <div className="tbk-sig">
                      <img src={signature.url} alt="Your signature, as attached" />
                      <div className="tbk-sig-meta">
                        <span>{signature.file.name}</span>
                        <span>{(signature.file.size / 1024).toFixed(0)} KB</span>
                        <button type="button" className="tbk-sig-remove" onClick={removeSignature}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {/* The real input is visually hidden and its label is the
                      button, so it looks the same in every browser but is
                      still a native file picker — keyboard, screen readers
                      and the phone camera all work as they would on any
                      other upload. */}
                  <input
                    ref={fileInput}
                    className="tbk-file-input"
                    type="file"
                    name="signature"
                    id={fieldId("signature")}
                    accept={SIGNATURE_TYPES.join(",")}
                    onChange={pickSignature}
                    aria-labelledby="tbk-signature-label"
                    aria-invalid={errors.signature ? true : undefined}
                    aria-describedby={[hintId("signature"), errors.signature ? errorId("signature") : ""]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  <label htmlFor={fieldId("signature")} className="tbk-file-btn">
                    {signature ? "Choose a different image" : "Attach signature image"}
                  </label>
                  <p className="tbk-hint" id={hintId("signature")}>
                    A clear photo or scan of your signature on plain paper. JPG,
                    PNG or WebP, under 2 MB.
                  </p>
                  {errorLine("signature")}
                </div>

                <div className="tbk-field">
                  <label htmlFor={fieldId("email")}>Email</label>
                  <input
                    {...a11y("email")}
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={set("email")}
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                  <p className="tbk-hint" id={hintId("email")}>
                    We&rsquo;ll send a copy of your request here.
                  </p>
                  {errorLine("email")}
                </div>

                {provider.alternateEmail ? (
                  <div className="tbk-field">
                    <label htmlFor={fieldId("alternateEmail")}>
                      Alternative email <span className="tbk-optional">(optional)</span>
                    </label>
                    <input
                      {...a11y("alternateEmail")}
                      type="email"
                      name="alternateEmail"
                      value={values.alternateEmail}
                      onChange={set("alternateEmail")}
                      autoComplete="email"
                      maxLength={254}
                    />
                    <p className="tbk-hint" id={hintId("alternateEmail")}>
                      A second address, in case we can&rsquo;t reach the first.
                    </p>
                    {errorLine("alternateEmail")}
                  </div>
                ) : null}

                <div className="tbk-field">
                  <label htmlFor={fieldId("phone")}>Phone number</label>
                  <input
                    {...a11y("phone")}
                    type="tel"
                    name="phone"
                    value={values.phone}
                    onChange={set("phone")}
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={20}
                    required
                  />
                  <p className="tbk-hint" id={hintId("phone")}>
                    A number a counsellor can call you on.
                  </p>
                  {errorLine("phone")}
                </div>
              </div>

              {/* The declaration from the paper form. Beside the fields on a
                  wide screen; above the submit button on a phone, so it is
                  read last, just before sending. */}
              <aside className="tbk-preview" aria-label="Your declaration">
                <p className="tbk-preview-kicker">Your declaration</p>
                <p className="tbk-preview-text">
                  I {blank(values.fullName.trim())} (name of candidate as in
                  passport), holder of passport number{" "}
                  {blank(values.passportNumber.trim())}, intend to take{" "}
                  {provider.examPhrase} on {blank(pickedDay(values.examDate))}{" "}
                  regarding venue {blank(values.testCity.trim())} and test
                  module {blank(values.module ? moduleLabel(values.module) : "")}.
                </p>
                <div className="tbk-preview-sign">
                  <div className="tbk-preview-sig">
                    {signature ? (
                      <img src={signature.url} alt="" />
                    ) : (
                      <span className="tbk-blank tbk-blank-wide" aria-hidden="true" />
                    )}
                    <span>Signature of candidate</span>
                  </div>
                  <div className="tbk-preview-date">
                    <strong>{longDay(today)}</strong>
                    <span>Date of signature</span>
                  </div>
                </div>
              </aside>

              <div className="tbk-actions">
                <label className="tbk-confirm">
                  <input
                    type="checkbox"
                    id={fieldId("confirm")}
                    checked={values.confirm}
                    onChange={(e) => {
                      setValues((prev) => ({ ...prev, confirm: e.target.checked }));
                      clearError("confirm");
                    }}
                    aria-invalid={errors.confirm ? true : undefined}
                    aria-describedby={errors.confirm ? errorId("confirm") : undefined}
                  />
                  <span>
                    I confirm these details match my passport exactly, and that
                    the signature attached is my own.
                  </span>
                </label>
                {errorLine("confirm")}

                <button className="tbk-submit" type="submit" disabled={sending}>
                  {sending ? "Sending your request…" : "Send booking request"}
                </button>
                {formError ? (
                  <p className="tbk-error tbk-form-error" role="alert">
                    {formError}
                  </p>
                ) : null}
                <p className="tbk-small">
                  We use these details only to book your test. They are not
                  shared with anyone except the test provider.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </article>
  );
}
