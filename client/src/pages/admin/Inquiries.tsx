import { useCallback, useEffect, useState } from "react";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import type {
  Inquiry,
  InquirySource,
  InquiryStatus,
  Paginated,
} from "../../types/api";

/**
 * How each form names itself in the list.
 *
 * `Record<InquirySource, ...>` and not a partial one on purpose: it makes
 * adding a source without labelling it a compile error rather than an
 * `undefined` in the middle of the admin list. It has already caught one —
 * "callback" was added on the server and reached this list unlabelled.
 */
const SOURCE_LABELS: Record<InquirySource, string> = {
  consultation: "Free consultation",
  contact: "Contact page",
  about: "Who We Are",
  "study-abroad": "Study abroad",
  home: "Home page",
  callback: "Call-back request",
  unknown: "Website",
};

/**
 * Whether an email went out, for one of the two the server sends.
 *
 * Renders nothing for an inquiry taken before mail existed — those have no
 * record at all, and "not emailed" would be a false accusation rather than
 * information. The three real states each say something different: sent is
 * done, skipped means there was nothing to do (mail is not configured, or
 * there was no address to write to), and failed is the one that needs a
 * person, so it carries the reason with it.
 *
 * BOTH ARE SHOWN, and they are shown separately on purpose. The office copy
 * going out while the enquirer's bounces means a mistyped address; the
 * reverse means a problem with our own inbox. One combined badge would hide
 * whichever of the two failed.
 */
function MailState({
  record,
  label,
}: {
  record: Inquiry["notified"];
  label: string;
}) {
  if (!record) return null;
  if (record.state === "sent") {
    return <span className="inquiry-mail is-sent">✓ {label} emailed</span>;
  }
  if (record.state === "skipped") {
    return (
      <span className="inquiry-mail is-skipped" title={record.reason}>
        {label} not emailed{record.reason ? ` — ${record.reason}` : ""}
      </span>
    );
  }
  return (
    <span className="inquiry-mail is-failed" title={record.reason}>
      ⚠ {label} email failed{record.reason ? ` — ${record.reason}` : ""}
    </span>
  );
}

export default function Inquiries() {
  const [data, setData] = useState<Paginated<Inquiry> | null>(null);
  const [filter, setFilter] = useState<"" | InquiryStatus>("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filter) params.set("status", filter);
    api
      .get<Paginated<Inquiry>>(`/inquiries?${params}`)
      .then((res) => setData(res.data));
  }, [filter, page]);

  useEffect(load, [load]);

  const setStatus = async (id: string, status: InquiryStatus) => {
    await api.patch(`/inquiries/${id}`, { status });
    load();
  };

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>Inquiries</h1>
          <select
            className="adm-select"
            value={filter}
            aria-label="Filter by status"
            onChange={(e) => {
              setPage(1);
              setFilter(e.target.value as "" | InquiryStatus);
            }}
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {!data ? (
          <p className="adm-quiet">Reading…</p>
        ) : data.items.length === 0 ? (
          <p className="adm-quiet">Nothing here. The contact form feeds this.</p>
        ) : (
          <>
            {data.items.map((q) => (
              <div className="adm-card inquiry-card" key={q._id}>
                <div className="inquiry-head">
                  <strong>{q.name}</strong>
                  <span className={`badge badge-${q.status}`}>{q.status}</span>
                </div>
                <p className="inquiry-meta">
                  {q.email} {q.phone && `· ${q.phone}`} · {q.service} ·{" "}
                  {SOURCE_LABELS[q.source ?? "unknown"]} ·{" "}
                  {new Date(q.createdAt).toLocaleString()}
                </p>
                <p>{q.message}</p>
                <span className="inquiry-mails">
                  <MailState record={q.notified} label="Office" />
                  <MailState record={q.acknowledged} label="Enquirer" />
                </span>
                <div className="inquiry-actions">
                  {q.status !== "contacted" && (
                    <button className="btn btn-small" onClick={() => setStatus(q._id, "contacted")}>
                      Mark contacted
                    </button>
                  )}
                  {q.status !== "closed" && (
                    <button className="btn btn-small" onClick={() => setStatus(q._id, "closed")}>
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
            {data.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <span>Page {data.page} of {data.totalPages}</span>
                <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
