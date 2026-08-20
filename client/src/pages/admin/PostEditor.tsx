import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import AdminNav from "./AdminNav";
import type { Post, PostStatus } from "../../types/api";

interface EditorForm {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  status: PostStatus;
}

const initial: EditorForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  status: "draft",
};

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<EditorForm>(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<{ post: Post }>(`/posts/admin/${id}`).then((res) => {
      const p = res.data.post;
      setForm({
        title: p.title,
        excerpt: p.excerpt ?? "",
        content: p.content,
        coverImage: p.coverImage ?? "",
        tags: p.tags.join(", "),
        status: p.status,
      });
    });
  }, [id]);

  const set = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (id) await api.put(`/posts/${id}`, payload);
      else await api.post("/posts", payload);
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err, "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="container section form" style={{ maxWidth: 720 }}>
        <h1>{id ? "Edit post" : "New post"}</h1>
        <label>Title<input name="title" value={form.title} onChange={set} /></label>
        <label>Excerpt (shown on cards)
          <input name="excerpt" value={form.excerpt} onChange={set} maxLength={300} />
        </label>
        <label>Cover image URL
          <input name="coverImage" value={form.coverImage} onChange={set} />
        </label>
        <label>Tags (comma-separated)
          <input name="tags" value={form.tags} onChange={set} />
        </label>
        <label>Content (separate paragraphs with a blank line)
          <textarea name="content" rows={14} value={form.content} onChange={set} />
        </label>
        <label>Status
          <select name="status" value={form.status} onChange={set}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save post"}
        </button>
        {error && <p className="form-error">{error}</p>}
      </div>
    </>
  );
}
