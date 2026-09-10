import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import { useAuth } from "../../context/AuthContext";
import { postPageLabel } from "../../types/api";
import type { Post } from "../../types/api";

/**
 * The blog posts table.
 *
 * This is what used to live at /admin and be called the dashboard. It was
 * never a dashboard — it was one list, and it meant the first screen after
 * signing in answered "what have I written?" rather than "what is the state
 * of the site?". The real dashboard has that address now; this has its own.
 *
 * THE "APPEARS ON" COLUMN IS HERE so that placement is visible from the
 * list rather than only from inside the editor. A post that is published
 * and placed nowhere looks identical to a correctly placed one until you
 * open it, and "why isn't my article on the Canada page" is a question the
 * table should be able to answer on its own.
 */
export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);

  const load = useCallback(() => {
    api.get<{ posts: Post[] }>("/posts/admin/all").then((res) => setPosts(res.data.posts));
  }, []);

  useEffect(load, [load]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this post permanently?")) return;
    await api.delete(`/posts/${id}`);
    load();
  };

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>Posts</h1>
          <Link to="/admin/posts/new" className="adm-btn">New post</Link>
        </div>

        <section className="adm-card">
          {!posts ? (
            <p className="adm-quiet">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="adm-quiet">No posts yet. Create your first one.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Title</th><th>Status</th><th>Appears on</th><th>Updated</th><th></th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  /* `data-label` on every cell is what lets the stylesheet
                     turn this table into a stack of cards below 760px — the
                     headers are hidden and each value is labelled by its own
                     cell. Taken from the markup rather than guessed at with
                     nth-child, so adding or reordering a column cannot
                     silently mislabel one. */
                  <tr key={p._id}>
                    <td data-label="Title">{p.title}</td>
                    <td data-label="Status">
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </td>
                    <td data-label="Appears on">
                      {p.pages?.length ? (
                        <span className="adm-places">
                          {p.pages.map((key) => (
                            <span key={key}>{postPageLabel(key)}</span>
                          ))}
                        </span>
                      ) : (
                        <span className="adm-quiet">Blog only</span>
                      )}
                    </td>
                    <td data-label="Updated">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td data-label="Actions">
                      <Link to={`/admin/posts/${p._id}/edit`}>Edit</Link>{" "}
                      {user?.role === "admin" && (
                        <button className="link-danger" onClick={() => remove(p._id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
