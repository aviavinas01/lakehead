import { useCallback, useEffect, useState, type FormEvent, useRef } from "react";
import api, { getErrorMessage } from "../../api/client";
import { mediaSrc } from "../../api/media";
import AdminNav from "./AdminNav";
import { useAuth } from "../../context/AuthContext";
import type { Album, Media, Paginated } from "../../types/api";
import { fetchGallery, type GalleryAlbum } from "../../api/gallery";

export default function MediaLibrary() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [data, setData] = useState<Paginated<Media> | null>(null);
  const [albumFilter, setAlbumFilter] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [uploading, setUploading] = useState(false);
  /* ONE hidden file input for the whole grid, and a note of which picture
     asked for it. A picker per card would put dozens of inputs in the DOM
     for a control only ever used once at a time. */
  const replaceInput = useRef<HTMLInputElement>(null);
  const replacing = useRef<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  /* WHAT THE PUBLIC GALLERY IS ACTUALLY SHOWING, read with the very function
     the public page calls — not a guess reassembled from albums and counts.
     A rule copied here ("published and has an image") would be a second copy
     of the condition, free to drift from the real one the day either
     changes. */
  const [liveAlbums, setLiveAlbums] = useState<GalleryAlbum[]>([]);
  const loadLive = useCallback(() => {
    fetchGallery().then(setLiveAlbums).catch(() => setLiveAlbums([]));
  }, []);
  useEffect(loadLive, [loadLive]);

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
      await api.post("/albums", {
        title: newAlbumTitle.trim(),
        description: newAlbumDesc.trim() || undefined,
      });
      setNewAlbumTitle("");
      setNewAlbumDesc("");
      loadAlbums();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  /* Every album field goes through here. The API has taken `description`
     and `order` all along — see album.schema — but this screen only ever
     sent `title` on create and `published` on toggle, so the two settings
     that decide a gallery section's standfirst and its position on the page
     could not be set at all. */
  const patchAlbum = async (album: Album, body: Partial<Album>) => {
    try {
      await api.put(`/albums/${album._id}`, body);
      loadAlbums();
      loadLive();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const togglePublished = async (album: Album) => {
    await api.put(`/albums/${album._id}`, { published: !album.published });
    loadAlbums();
    loadLive();
  };

  const deleteAlbum = async (album: Album) => {
    if (!window.confirm(`Delete album "${album.title}" and ALL media inside it?`)) return;
    await api.delete(`/albums/${album._id}`);
    if (albumFilter === album._id) setAlbumFilter("");
    loadAlbums();
    loadMedia();
    loadLive();
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
      loadLive();
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  /* Opens the picker on behalf of one card. */
  const askForReplacement = (m: Media) => {
    replacing.current = m._id;
    if (replaceInput.current) {
      replaceInput.current.value = ""; // so re-picking the same file still fires
      replaceInput.current.click();
    }
  };

  const doReplace = async (file: File) => {
    const id = replacing.current;
    replacing.current = null;
    if (!id) return;
    setBusyId(id);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      /* PUT, not POST: the record already exists and keeps its id, album,
         title and position — only the bytes behind it change. See
         mediaService.replaceFile. */
      await api.put(`/media/${id}/file`, form);
      loadMedia();
      loadLive();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const deleteMedia = async (m: Media) => {
    if (!window.confirm("Delete this file permanently?")) return;
    await api.delete(`/media/${m._id}`);
    loadMedia();
    loadLive();
  };

  return (
    <>
      <AdminNav />
      <div className="container section">
        <div className="admin-header">
          <h1>Media Library</h1>
        </div>
        {error && <p className="form-error">{error}</p>}

        {/* THE QUESTION THIS SCREEN COULD NOT ANSWER BEFORE: is what I am
            looking at what the public sees? The gallery falls back to
            placeholder photographs whenever no published album has an image
            in it, so an empty library and a full-looking gallery are the
            normal state before anything is uploaded — which reads as a bug
            unless the screen says so. */}
        <div className={`media-status${liveAlbums.length ? " is-live" : ""}`}>
          {liveAlbums.length ? (
            <p>
              <strong>The public gallery is live.</strong> It is showing{" "}
              {liveAlbums.length} published album
              {liveAlbums.length === 1 ? "" : "s"}:{" "}
              {liveAlbums.map((a) => a.title).join(", ")}. Anything you add to
              a published album appears on the site immediately.
            </p>
          ) : (
            <p>
              <strong>The public gallery is showing placeholders.</strong> The
              photographs on it are stand-ins the site ships with, not
              uploads. Create an album, publish it, and upload into it — the
              placeholders disappear on their own the moment a published album
              has a picture in it. Nothing needs deleting.
            </p>
          )}
        </div>

        <div className="card">
          <h2>Albums</h2>
          <form onSubmit={createAlbum} className="media-inline-form">
            <input
              placeholder="New album title (e.g. Office Tour 2026)"
              value={newAlbumTitle}
              onChange={(e) => setNewAlbumTitle(e.target.value)}
            />
            <input
              placeholder="Standfirst (optional)"
              value={newAlbumDesc}
              onChange={(e) => setNewAlbumDesc(e.target.value)}
            />
            <button className="btn btn-small" type="submit">Create album</button>
          </form>
          {albums.length === 0 ? (
            <p>No albums yet.</p>
          ) : (
            albums.map((a) => (
              <div className="media-album" key={a._id}>
                <div className="media-album-row">
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
                {/* The two settings that shape the section on the public page.
                    Saved on blur — there is no save button because there is
                    nothing to batch; each field stands alone. */}
                <div className="media-album-fields">
                  <label>
                    <span>Standfirst</span>
                    <input
                      defaultValue={a.description ?? ""}
                      placeholder="The line under the heading, on the gallery"
                      onBlur={(e) => {
                        if (e.target.value !== (a.description ?? "")) {
                          void patchAlbum(a, { description: e.target.value });
                        }
                      }}
                    />
                  </label>
                  <label className="media-album-order">
                    <span>Order</span>
                    <input
                      type="number"
                      defaultValue={a.order ?? 0}
                      onBlur={(e) => {
                        const next = Number(e.target.value) || 0;
                        if (next !== (a.order ?? 0)) {
                          void patchAlbum(a, { order: next });
                        }
                      }}
                    />
                  </label>
                </div>
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
            {/* Off-screen, shared by every card. */}
            <input
              ref={replaceInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void doReplace(f);
              }}
            />
            <div className="media-grid">
              {data.items.map((m) => (
                <div className="card media-card" key={m._id}>
                  {m.type === "image" ? (
                    <img src={mediaSrc(m.url)} alt={m.title || "Uploaded image"} loading="lazy" />
                  ) : (
                    <video src={mediaSrc(m.url)} controls preload="metadata" />
                  )}
                  <p className="media-title">{m.title || "Untitled"}</p>
                  <div className="media-card-actions">
                    {/* Replace rather than delete-and-upload: the picture
                        keeps its place in the album, its title and its
                        caption, so swapping one in a live gallery does not
                        move it to the end. */}
                    <button
                      className="btn btn-small"
                      onClick={() => askForReplacement(m)}
                      disabled={busyId === m._id}
                    >
                      {busyId === m._id ? "Replacing…" : "Replace"}
                    </button>
                    {user?.role === "admin" && (
                      <button className="btn btn-small btn-danger" onClick={() => deleteMedia(m)}>
                        Delete
                      </button>
                    )}
                  </div>
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
