import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import { useAuth } from "../../context/AuthContext";
import type { Post } from "../../types/api";

/**
 * The blog posts table.
 *
 * This is what used to live at /admin and be called the dashboard. It was
 * never a dashboard — it was one list, and it meant the first screen after
 * signing in answered "what have I written?" rather than "what is the state
 * of the site?". The real dashboard has that address now; this has its own.
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
                <tr><th>Title</th><th>Status</th><th>Updated</th><th></th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td>
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
