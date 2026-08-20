import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import type { Paginated, PostSummary } from "../types/api";

export default function Blog() {
  const [data, setData] = useState<Paginated<PostSummary> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Paginated<PostSummary>>(`/posts?page=${page}&limit=9`)
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err, "Couldn't load posts.")));
  }, [page]);

  if (error) return <div className="container section">{error}</div>;
  if (!data) return <div className="container section">Loading posts…</div>;

  return (
    <section className="section container">
      <h1>Blog & Updates</h1>
      {data.items.length === 0 && <p>No posts yet — check back soon.</p>}
      <div className="grid grid-3">
        {data.items.map((p) => (
          <Link to={`/blog/${p.slug}`} className="card post-card" key={p._id}>
            {p.coverImage && <img src={p.coverImage} alt="" />}
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            {p.publishedAt && <time>{new Date(p.publishedAt).toLocaleDateString()}</time>}
          </Link>
        ))}
      </div>
      {data.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {data.page} of {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </section>
  );
}
