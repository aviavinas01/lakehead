import { useCallback, useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../../api/client";
import AdminNav from "./AdminNav";
import { useAuth } from "../../context/AuthContext";
import type { Album, Media, Paginated } from "../../types/api";

export default function MediaLibrary() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [data, setData] = useState<Paginated<Media> | null>(null);
  const [albumFilter, setAlbumFilter] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadAlbums = useCallback(() => {
    api.get<{ albums: Album[] }>("/albums/admin/all").then((res) => setAlbums(res.data.albums));
  }, []);

  const loadMedia = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (albumFilter) params.set("album", albumFilter);
    api.get<Paginated<Media>>(`/media?${params}`).then((res) => setData(res.data));
  }, [albumFilter, page]);

  useEffect(loadAlbums, [loadAlbums]);
  useEffect(loadMedia, [loadMedia]);

  const createAlbum = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    try {
      await api.post("/albums", { title: newAlbumTitle.trim() });
      setNewAlbumTitle("");
      loadAlbums();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const togglePublished = async (album: Album) => {
    await api.put(`/albums/${album._id}`, { published: !album.published });
    loadAlbums();
  };

  const deleteAlbum = async (album: Album) => {
    if (!window.confirm(`Delete album "${album.title}" and ALL media inside it?`)) return;
    await api.delete(`/albums/${album._id}`);
    if (albumFilter === album._id) setAlbumFilter("");
    loadAlbums();
    loadMedia();
  };

  const uploadFile = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      if (uploadTitle.trim()) form.append("title", uploadTitle.trim());
      if (uploadAlbum) form.append("album", uploadAlbum);
      await api.post("/media", form);
      setFile(null);
      setUploadTitle("");
      (document.getElementById("media-file-input") as HTMLInputElement).value = "";
      loadMedia();
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (m: Media) => {
    if (!window.confirm("Delete this file permanently?")) return;
    await api.delete(`/media/${m._id}`);
    loadMedia();
  };

  return (
    <>
      <AdminNav />
      <div className="container section">
        <div className="admin-header">
          <h1>Media Library</h1>
        </div>
        {error && <p className="form-error">{error}</p>}

        <div className="card">
          <h2>Albums</h2>
          <form onSubmit={createAlbum} className="media-inline-form">
            <input
              placeholder="New album title (e.g. Office Tour 2026)"
              value={newAlbumTitle}
              onChange={(e) => setNewAlbumTitle(e.target.value)}
            />
            <button className="btn btn-small" type="submit">Create album</button>
          </form>
          {albums.length === 0 ? (
            <p>No albums yet.</p>
          ) : (
            albums.map((a) => (
              <div className="media-album-row" key={a._id}>
                <strong>{a.title}</strong>
                <span className={`badge badge-${a.published ? "published" : "draft"}`}>
                  {a.published ? "published" : "hidden"}
                </span>
                <button className="btn btn-small" onClick={() => togglePublished(a)}>
                  {a.published ? "Hide" : "Publish"}
                </button>
                {user?.role === "admin" && (
                  <button className="btn btn-small btn-danger" onClick={() => deleteAlbum(a)}>
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h2>Upload picture or video</h2>
          <form onSubmit={uploadFile} className="media-inline-form">
            <input
              id="media-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <input
              placeholder="Title (optional)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <select value={uploadAlbum} onChange={(e) => setUploadAlbum(e.target.value)}>
              <option value="">No album</option>
              {albums.map((a) => (
                <option key={a._id} value={a._id}>{a.title}</option>
              ))}
            </select>
            <button className="btn btn-small" type="submit" disabled={!file || uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </form>
        </div>

        <div className="admin-header">
          <h2>Files</h2>
          <select
            value={albumFilter}
            onChange={(e) => {
              setPage(1);
              setAlbumFilter(e.target.value);
            }}
          >
            <option value="">All albums</option>
            {albums.map((a) => (
              <option key={a._id} value={a._id}>{a.title}</option>
            ))}
          </select>
        </div>
        {!data ? (
          <p>Loading…</p>
        ) : data.items.length === 0 ? (
          <p>No media yet — upload your first picture or video above.</p>
        ) : (
          <>
            <div className="media-grid">
              {data.items.map((m) => (
                <div className="card media-card" key={m._id}>
                  {m.type === "image" ? (
                    <img src={m.url} alt={m.title || "Uploaded image"} loading="lazy" />
                  ) : (
                    <video src={m.url} controls preload="metadata" />
                  )}
                  <p className="media-title">{m.title || "Untitled"}</p>
                  {user?.role === "admin" && (
                    <button className="btn btn-small btn-danger" onClick={() => deleteMedia(m)}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
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
