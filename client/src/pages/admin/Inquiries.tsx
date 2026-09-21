import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import MailState from "./MailState";
import TestBookingsPanel from "./TestBookingsPanel";
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

/* MailState moved to its own file when the test-booking tab needed it too. */

/**
 * The enquiries list — every contact, consultation and call-back form.
 *
 * Unchanged from when it was the whole page: same filter, same cards, same
 * actions. It became a panel when IELTS booking requests got a tab beside
 * it, and its status filter moved from the page heading into its own
 * toolbar, since it filters this tab and not the other one.
 */
function EnquiriesPanel() {
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
    <>
        <div className="adm-toolbar">
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
    </>
  );
}

const TABS = [
  { to: "/admin/inquiries", label: "Enquiries" },
  { to: "/admin/test-bookings", label: "Test bookings" },
];

/**
 * Inquiries — two tabs, one per kind of thing the public sends us.
 *
 * Route-driven, the same as Media and Events & news: /admin/inquiries and
 * /admin/test-bookings both render this, so each tab has its own address
 * and survives a refresh. See App.tsx and the matching pill in AdminNav.
 */
export default function Inquiries() {
  const { pathname } = useLocation();
  const onBookings = pathname.startsWith("/admin/test-bookings");

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>Inquiries</h1>
        </div>

        <nav className="adm-tabs">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={(t.to === "/admin/test-bookings") === onBookings ? "is-on" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {onBookings ? <TestBookingsPanel /> : <EnquiriesPanel />}
      </main>
    </div>
  );
}
