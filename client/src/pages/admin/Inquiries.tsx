import { useCallback, useEffect, useState } from "react";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import type { Inquiry, InquiryStatus, Paginated } from "../../types/api";

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
    <>
      <AdminNav />
      <div className="container section">
        <div className="admin-header">
          <h1>Inquiries</h1>
          <select
            value={filter}
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
          <p>Loading…</p>
        ) : data.items.length === 0 ? (
          <p>No inquiries found.</p>
        ) : (
          <>
            {data.items.map((q) => (
              <div className="card inquiry-card" key={q._id}>
                <div className="inquiry-head">
                  <strong>{q.name}</strong>
                  <span className={`badge badge-${q.status}`}>{q.status}</span>
                </div>
                <p className="inquiry-meta">
                  {q.email} {q.phone && `· ${q.phone}`} · {q.service} ·{" "}
                  {new Date(q.createdAt).toLocaleString()}
                </p>
                <p>{q.message}</p>
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
      </div>
    </>
  );
}
