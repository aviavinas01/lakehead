import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../api/client";
import {
  deleteTestBooking,
  fetchTestBookings,
  formatExamDay,
  signatureSrc,
  updateTestBooking,
  type TestBooking,
  type TestProvider,
} from "../../api/testBookings";
import { PROVIDERS, moduleLabel } from "../../data/testBooking";
import type { InquiryStatus, Paginated } from "../../types/api";
import MailState from "./MailState";

/**
 * IELTS booking requests — the second tab of Inquiries.
 *
 * ------------------------------------------------------------------
 * LAID OUT FOR COPYING, because that is the job: a counsellor takes each
 * field and types it into IDP's or the British Council's own system. So
 * every field is on its own labelled line in the order the provider's form
 * asks for them, and the passport number — the one that has to be exact —
 * has a copy button.
 *
 * THE SIGNATURE IS FETCHED FROM THE ADMIN-ONLY ENDPOINT, not from a public
 * address; there is no public address. The <img> carries the session
 * cookie like any same-origin request. Opening it full size is a link to
 * the same endpoint.
 *
 * DELETE REMOVES THE SIGNATURE TOO, and says so. This is where personal
 * data leaves the system when a candidate asks, or once a booking is done
 * with, so the confirmation names what goes.
 * ------------------------------------------------------------------
 */

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

function Signature({ booking }: { booking: TestBooking }) {
  const [broken, setBroken] = useState(false);
  const src = signatureSrc(booking._id);

  if (broken) {
    return (
      <p className="tbk-adm-sig-missing">
        The signature image could not be loaded. If this booking was taken
        before a storage change, its file may no longer exist.
      </p>
    );
  }
  return (
    <a className="tbk-adm-sig" href={src} target="_blank" rel="noopener noreferrer">
      <img
        src={src}
        alt={`Signature of ${booking.fullName}`}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
      <span>
        Open full size · {kb(booking.signature.bytes)}
      </span>
    </a>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard access refused (an insecure origin, or a browser setting).
         The value is on screen to select by hand; nothing else to do. */
    }
  };
  return (
    <button type="button" className="tbk-copy" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function TestBookingsPanel() {
  const [data, setData] = useState<Paginated<TestBooking> | null>(null);
  const [status, setStatusFilter] = useState<"" | InquiryStatus>("");
  const [provider, setProvider] = useState<"" | TestProvider>("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    fetchTestBookings({
      page,
      status: status || undefined,
      provider: provider || undefined,
    })
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, "Could not load test bookings.")));
  }, [page, status, provider]);

  useEffect(load, [load]);

  const setStatus = async (id: string, next: InquiryStatus) => {
    try {
      await updateTestBooking(id, { status: next });
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update that booking."));
    }
  };

  const remove = async (b: TestBooking) => {
    const ok = window.confirm(
      `Delete ${b.fullName}'s ${PROVIDERS[b.provider].name} booking request?\n\n` +
        "This removes their passport number and signature image for good. It cannot be undone."
    );
    if (!ok) return;
    try {
      await deleteTestBooking(b._id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete that booking."));
    }
  };

  return (
    <>
      <div className="adm-toolbar">
        <select
          className="adm-select"
          value={status}
          aria-label="Filter by status"
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as "" | InquiryStatus);
          }}
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="adm-select"
          value={provider}
          aria-label="Filter by test provider"
          onChange={(e) => {
            setPage(1);
            setProvider(e.target.value as "" | TestProvider);
          }}
        >
          <option value="">Both providers</option>
          <option value="idp">IDP IELTS</option>
          <option value="british-council">British Council IELTS</option>
        </select>
      </div>

      {error ? (
        <p className="adm-quiet tbk-adm-error" role="alert">
          {error}
        </p>
      ) : null}

      {!data ? (
        error ? null : <p className="adm-quiet">Reading…</p>
      ) : data.items.length === 0 ? (
        <p className="adm-quiet">
          No booking requests{status || provider ? " match these filters" : " yet"}. They
          arrive from the IDP and British Council forms on the Test Booking page.
        </p>
      ) : (
        <>
          {data.items.map((b) => (
            <article className="adm-card inquiry-card tbk-adm-card" key={b._id}>
              <div className="inquiry-head">
                <strong>{b.fullName}</strong>
                <span className="tbk-adm-provider">{PROVIDERS[b.provider].name}</span>
                <span className={`badge badge-${b.status}`}>{b.status}</span>
              </div>

              <div className="tbk-adm-body">
                <dl className="tbk-adm-details">
                  <div>
                    <dt>Name (as in passport)</dt>
                    <dd>{b.fullName}</dd>
                  </div>
                  <div>
                    <dt>Passport number</dt>
                    <dd className="tbk-adm-passport">
                      <code>{b.passportNumber}</code>
                      <CopyButton value={b.passportNumber} label="passport number" />
                    </dd>
                  </div>
                  <div>
                    <dt>Exam date</dt>
                    <dd>
                      <strong>{formatExamDay(b.examDate)}</strong>
                    </dd>
                  </div>
                  <div>
                    <dt>Test city</dt>
                    <dd>{b.testCity}</dd>
                  </div>
                  <div>
                    <dt>Module</dt>
                    <dd>{moduleLabel(b.module)}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${b.email}`}>{b.email}</a>
                    </dd>
                  </div>
                  {b.alternateEmail ? (
                    <div>
                      <dt>Alternative email</dt>
                      <dd>
                        <a href={`mailto:${b.alternateEmail}`}>{b.alternateEmail}</a>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Date of signature</dt>
                    <dd>{new Date(b.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>

                <div className="tbk-adm-sigwrap">
                  <p className="tbk-adm-sigtitle">Signature of candidate</p>
                  <Signature booking={b} />
                </div>
              </div>

              <span className="inquiry-mails">
                <MailState record={b.notified} label="Office" />
                <MailState record={b.acknowledged} label="Candidate" />
              </span>

              <div className="inquiry-actions">
                {b.status !== "contacted" && (
                  <button className="btn btn-small" onClick={() => setStatus(b._id, "contacted")}>
                    Mark contacted
                  </button>
                )}
                {b.status !== "closed" && (
                  <button className="btn btn-small" onClick={() => setStatus(b._id, "closed")}>
                    Close
                  </button>
                )}
                <button className="btn btn-small btn-danger" onClick={() => remove(b)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {data.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
