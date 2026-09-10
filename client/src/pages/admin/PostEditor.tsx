import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import { mediaSrc } from "../../api/media";
import AdminNav from "./AdminNav";
import {
  renderArticle,
  readingTime,
  wordCount,
  autoExcerpt,
  SYNTAX_HELP,
} from "../../lib/richText";
import { LIVE_POST_PAGES, POST_PAGES } from "../../types/api";
import type { Media, Post, PostPage, PostStatus } from "../../types/api";

/**
 * The post editor — /admin/posts/new and /admin/posts/:id/edit.
 *
 * The writing surface stays a plain textarea on purpose. A contenteditable
 * rich-text editor is a large amount of fragile code, and it stores markup,
 * which then has to be sanitised on the way back out. Posts here are stored
 * as text in the small markup that lib/richText.tsx understands, so there is
 * no HTML anywhere in the pipeline and nothing to sanitise. What makes that
 * pleasant rather than austere is the other three things on this screen:
 *
 *   - a toolbar that wraps the selection, so nobody has to remember the
 *     syntax to make a word bold;
 *   - image upload, both for the cover and inline — pick a file, it goes to
 *     /media, and the markup is inserted at the cursor;
 *   - a live preview rendered by the SAME function the public article page
 *     calls, so it is the article, not an approximation of it.
 *
 * DRAFTS AND PUBLISHING ARE TWO BUTTONS, not a dropdown. Choosing "status:
 * published" in a select and then pressing Save is two decisions to express
 * one intent, and it is the arrangement that gets a half-written post
 * published by accident.
 *
 * "APPEARS ON" IS CHECKBOXES AND TAGS ARE A TEXT BOX, and the difference is
 * not laziness in one or fussiness in the other. Tags describe the article
 * and the writer invents them; nothing breaks if two posts say "visas" and
 * "visa". Placement decides which page an article shows up on, so it is
 * chosen from a fixed list the pages themselves are built from — typing
 * "study in usa" into a box and finding out weeks later that the guide's
 * sidebar never picked it up is exactly the failure the closed list exists
 * to make impossible. See POST_PAGES in types/api.ts.
 */

interface EditorForm {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  /** Page keys ticked in the "Appears on" panel. */
  pages: PostPage[];
  status: PostStatus;
}

const initial: EditorForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  pages: [],
  status: "draft",
};

/* The checkbox list, split into its two headings. Derived from POST_PAGES
   rather than written out again, so adding a destination there is the only
   edit adding a destination needs. */
/* LIVE_POST_PAGES, not POST_PAGES: a retired placement stays in the full
   list so old posts still read back with a proper name, but must not be
   offered as somewhere new work can be put. See types/api.ts. */
const PAGE_GROUPS = [...new Set(LIVE_POST_PAGES.map((p) => p.group))].map((group) => ({
  group,
  pages: LIVE_POST_PAGES.filter((p) => p.group === group),
}));

/** What the toolbar buttons do to the selection. */
type Tool =
  | { label: string; title: string; wrap: [string, string] }
  | { label: string; title: string; line: string };

const TOOLS: Tool[] = [
  { label: "B", title: "Bold", wrap: ["**", "**"] },
  { label: "I", title: "Italic", wrap: ["*", "*"] },
  { label: "H2", title: "Section heading", line: "## " },
  { label: "H3", title: "Sub-heading", line: "### " },
  { label: "❝", title: "Quote", line: "> " },
  { label: "•", title: "Bulleted list", line: "- " },
  { label: "1.", title: "Numbered list", line: "1. " },
  { label: "🔗", title: "Link", wrap: ["[", "](https://)"] },
  { label: "—", title: "Divider", line: "---" },
];

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<EditorForm>(initial);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"" | "draft" | "published">("");
  const [loading, setLoading] = useState(Boolean(id));
  const [uploading, setUploading] = useState<"" | "cover" | "inline">("");
  const [preview, setPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const area = useRef<HTMLTextAreaElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const inlineInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ post: Post }>(`/posts/admin/${id}`)
      .then((res) => {
        const p = res.data.post;
        setForm({
          title: p.title,
          excerpt: p.excerpt ?? "",
          content: p.content,
          coverImage: p.coverImage ?? "",
          tags: p.tags.join(", "),
          /* `?? []` because posts written before placement existed have no
             `pages` at all, and a missing array here would crash the panel
             on the first post anyone opens. */
          pages: p.pages ?? [],
          status: p.status,
        });
      })
      .catch((err) => setError(getErrorMessage(err, "Couldn't load that post")))
      .finally(() => setLoading(false));
  }, [id]);

  /**
   * Empties the editor when the address becomes /admin/posts/new.
   *
   * REACT ROUTER REUSES THIS COMPONENT between the two addresses — same
   * element type, so going from editing a post to writing a new one is a
   * prop change, not a remount. The loader above is keyed on `id` and
   * returns early when there is none, so without this the article you just
   * published stays sitting in the boxes and the next save quietly writes a
   * second copy of it.
   *
   * On the route it is a no-op: the form is already `initial` at mount, and
   * after a first save the id goes from absent to present, which is the
   * other direction.
   */
  useEffect(() => {
    if (id) return;
    setForm(initial);
    setNotice("");
    setError("");
  }, [id]);

  /* Ctrl/Cmd+S saves without publishing — the reflex every writer has. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save(form.status === "published" ? "published" : "draft");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const set = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  /* Kept in POST_PAGES order rather than tick order, so the summary line
     under the panel reads the same way twice running. */
  const togglePage = (key: PostPage) =>
    setForm((f) => ({
      ...f,
      pages: f.pages.includes(key)
        ? f.pages.filter((p) => p !== key)
        : POST_PAGES.filter((p) => p.key === key || f.pages.includes(p.key)).map((p) => p.key),
    }));

  /**
   * Replaces the current selection and restores the caret afterwards.
   * Going through the textarea's own value rather than document.execCommand
   * means this behaves identically in every browser — at the cost of losing
   * the native undo stack, which is why the caret is put back by hand.
   */
  const applyTool = (tool: Tool) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: from, selectionEnd: to, value } = el;
    const selected = value.slice(from, to);

    let next: string;
    let caret: number;

    if ("wrap" in tool) {
      const [open, close] = tool.wrap;
      next = value.slice(0, from) + open + selected + close + value.slice(to);
      /* With nothing selected, land between the markers so the next
         keystroke goes inside them. */
      caret = selected ? from + open.length + selected.length + close.length : from + open.length;
    } else {
      /* A line tool applies to every line the selection touches, so
         highlighting four lines and pressing "•" makes a four-item list. */
      const lineStart = value.lastIndexOf("\n", from - 1) + 1;
      const block = value.slice(lineStart, to);
      const prefixed = block
        .split("\n")
        .map((l) => (l.startsWith(tool.line) ? l : tool.line + l))
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(to);
      caret = lineStart + prefixed.length;
    }

    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const insertAtCursor = (text: string) => {
    const el = area.current;
    if (!el) {
      setForm((f) => ({ ...f, content: `${f.content}\n\n${text}\n` }));
      return;
    }
    const { selectionStart: at, value } = el;
    const next = `${value.slice(0, at)}\n\n${text}\n\n${value.slice(at)}`;
    setForm((f) => ({ ...f, content: next }));
    const caret = at + text.length + 4;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  /**
   * Uploads to the media library and hands back the stored path.
   *
   * Note the path is relative — `/uploads/<file>` — and is saved that way.
   * `mediaSrc` puts the API's origin in front at render time, so moving the
   * API to another host does not break every image ever uploaded.
   *
   * FILED INTO "BLOGS", both the cover and anything placed in the body. The
   * server resolves that key to a real album and creates it the first time,
   * so the media library stays sorted without anybody choosing an album
   * while they are in the middle of writing. See services/managedAlbums.
   */
  const upload = async (file: File): Promise<string> => {
    const body = new FormData();
    body.append("file", file);
    body.append("title", file.name);
    body.append("albumKey", "blogs");
    const { data } = await api.post<{ media: Media }>("/media", body);
    return data.media.url;
  };

  const onCoverPicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("cover");
    setError("");
    try {
      const url = await upload(file);
      setForm((f) => ({ ...f, coverImage: url }));
    } catch (err) {
      setError(getErrorMessage(err, "Cover upload failed"));
    } finally {
      setUploading("");
      if (coverInput.current) coverInput.current.value = "";
    }
  };

  const onInlinePicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("inline");
    setError("");
    try {
      const url = await upload(file);
      /* The alt text doubles as the caption on the article page, so it is
         seeded with something removable rather than left empty. */
      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, "")}](${url})`);
    } catch (err) {
      setError(getErrorMessage(err, "Image upload failed"));
    } finally {
      setUploading("");
      if (inlineInput.current) inlineInput.current.value = "";
    }
  };

  const save = async (status: PostStatus) => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("A title and some content are needed before saving.");
      return;
    }
    setBusy(status);
    setError("");
    setNotice("");

    const payload = {
      title: form.title.trim(),
      /* An unwritten excerpt is filled from the opening of the article
         rather than left blank — every card on /blog shows one. */
      excerpt: (form.excerpt.trim() || autoExcerpt(form.content)).slice(0, 300),
      content: form.content,
      coverImage: form.coverImage,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      pages: form.pages,
      status,
    };

    try {
      if (id) {
        await api.put(`/posts/${id}`, payload);
        setForm((f) => ({ ...f, status }));
        setNotice(status === "published" ? "Published." : "Saved as draft.");
      } else {
        const { data } = await api.post<{ post: Post }>("/posts", payload);
        /* Straight into edit mode on the new post, so a second save updates
           it instead of creating a duplicate. */
        navigate(`/admin/posts/${data.post._id}/edit`, { replace: true });
        setNotice(status === "published" ? "Published." : "Saved as draft.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Save failed"));
    } finally {
      setBusy("");
    }
  };

  const rendered = useMemo(
    () => (preview ? renderArticle(form.content) : null),
    [preview, form.content]
  );

  const words = wordCount(form.content);
  const cover = form.coverImage ? mediaSrc(form.coverImage) : "";

  return (
    <>
      <AdminNav />
      <div className="ed">
        <div className="container">
          <div className="ed-bar">
            <div className="ed-bar-left">
              {/* THE WAY BACK OUT. Without it the only exits from a saved
                  post were the browser's back button and the logo, which
                  leaves the admin entirely — so writing two posts in a row
                  meant leaving the dashboard and coming back in. It is a
                  link to the list rather than a "new post" button because
                  the list is where you check what you just published before
                  starting the next one. */}
              <Link className="ed-back" to="/admin/posts">
                ← All posts
              </Link>
              <h1>{id ? "Edit post" : "New post"}</h1>
              <span className={`badge badge-${form.status}`}>{form.status}</span>
            </div>
            <div className="ed-bar-right">
              <button
                type="button"
                className="btn btn-small"
                onClick={() => setPreview((p) => !p)}
                aria-pressed={preview}
              >
                {preview ? "Back to writing" : "Preview"}
              </button>
              <button
                type="button"
                className="btn btn-small"
                onClick={() => void save("draft")}
                disabled={busy !== ""}
              >
                {busy === "draft" ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => void save("published")}
                disabled={busy !== ""}
              >
                {busy === "published"
                  ? "Publishing…"
                  : form.status === "published"
                    ? "Update"
                    : "Publish"}
              </button>
            </div>
          </div>

          {error ? <p className="form-error ed-msg">{error}</p> : null}
          {/* Straight into the next one. Offered only after a save has
              actually landed, so it appears at the moment somebody is most
              likely to want it and never sits there as a way to abandon
              unsaved work. The emptying is handled by the effect above, not
              by this link — see it for why. */}
          {notice ? (
            <p className="form-success ed-msg ed-msg-done">
              <span>{notice}</span>
              <Link to="/admin/posts/new">Write another post →</Link>
            </p>
          ) : null}

          {loading ? (
            <p className="ed-loading">Loading…</p>
          ) : (
            <div className="ed-split">
              <div className="ed-main">
                <input
                  className="ed-title"
                  name="title"
                  value={form.title}
                  onChange={set}
                  placeholder="Article title"
                  aria-label="Title"
                />

                {preview ? (
                  <div className="ed-preview">
                    {cover ? (
                      <img className="ed-preview-cover" src={cover} alt="" />
                    ) : null}
                    <h1>{form.title || "Untitled"}</h1>
                    {form.excerpt ? (
                      <p className="ed-preview-standfirst">{form.excerpt}</p>
                    ) : null}
                    <div className="art-prose">{rendered}</div>
                  </div>
                ) : (
                  <>
                    <div className="ed-toolbar" role="toolbar" aria-label="Formatting">
                      {TOOLS.map((t) => (
                        <button
                          key={t.title}
                          type="button"
                          title={t.title}
                          aria-label={t.title}
                          onClick={() => applyTool(t)}
                        >
                          {t.label}
                        </button>
                      ))}
                      <span className="ed-toolbar-gap" />
                      <button
                        type="button"
                        onClick={() => inlineInput.current?.click()}
                        disabled={uploading !== ""}
                        title="Insert an image at the cursor"
                      >
                        {uploading === "inline" ? "Uploading…" : "Insert image"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHelp((h) => !h)}
                        aria-pressed={showHelp}
                        title="Formatting help"
                      >
                        ?
                      </button>
                      <input
                        ref={inlineInput}
                        id="ed-inline-file"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={onInlinePicked}
                      />
                    </div>

                    {showHelp ? (
                      <dl className="ed-help">
                        {SYNTAX_HELP.map((h) => (
                          <div key={h.code}>
                            <dt>{h.code}</dt>
                            <dd>{h.means}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    <textarea
                      ref={area}
                      className="ed-area"
                      name="content"
                      value={form.content}
                      onChange={set}
                      rows={26}
                      placeholder={"Write the article here.\n\nA blank line starts a new paragraph. Use the toolbar above, or press ? for the formatting it produces."}
                      aria-label="Content"
                    />
                    <p className="ed-count">
                      {words} {words === 1 ? "word" : "words"} · {readingTime(form.content)} min read
                    </p>
                  </>
                )}
              </div>

              <aside className="ed-side">
                <section className="ed-panel">
                  <h2>Cover image</h2>
                  {cover ? (
                    <div className="ed-cover">
                      <img src={cover} alt="" />
                      <button
                        type="button"
                        className="ed-cover-clear"
                        onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                        aria-label="Remove cover image"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className="ed-hint">
                      Shown on the article page and on every card that links
                      to it. Landscape works best.
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => coverInput.current?.click()}
                    disabled={uploading !== ""}
                  >
                    {uploading === "cover"
                      ? "Uploading…"
                      : cover
                        ? "Replace image"
                        : "Upload image"}
                  </button>
                  <input
                    ref={coverInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onCoverPicked}
                  />
                  <label className="ed-field">
                    <span>…or paste a URL</span>
                    <input name="coverImage" value={form.coverImage} onChange={set} />
                  </label>
                </section>

                <section className="ed-panel">
                  <h2>Standfirst</h2>
                  <label className="ed-field">
                    <span>The line under the headline, and on cards</span>
                    <textarea
                      name="excerpt"
                      value={form.excerpt}
                      onChange={set}
                      rows={4}
                      maxLength={300}
                    />
                  </label>
                  <p className="ed-hint">
                    {form.excerpt
                      ? `${form.excerpt.length}/300`
                      : "Left empty, the opening of the article is used."}
                  </p>
                </section>

                {/* PLACEMENT SITS ABOVE TAGS because it is the decision
                    with consequences. Nothing happens if the tags are
                    imperfect; leave this empty and the article exists only
                    on /blog, which is a choice worth making on purpose
                    rather than discovering. */}
                <section className="ed-panel">
                  <h2>Appears on</h2>
                  <p className="ed-hint">
                    Tick the pages this article belongs to. It shows in the
                    sidebar of each one, and on the blog either way.
                  </p>
                  {PAGE_GROUPS.map((g) => (
                    <fieldset className="ed-pages" key={g.group}>
                      <legend>{g.group}</legend>
                      {g.pages.map((pg) => (
                        <label key={pg.key}>
                          <input
                            type="checkbox"
                            checked={form.pages.includes(pg.key)}
                            onChange={() => togglePage(pg.key)}
                          />
                          <span>{pg.label}</span>
                        </label>
                      ))}
                    </fieldset>
                  ))}
                  <p className="ed-hint">
                    {form.pages.length === 0
                      ? "Not placed on any page — it will appear on the blog only."
                      : `On ${form.pages.length} ${form.pages.length === 1 ? "page" : "pages"}.`}
                  </p>
                </section>

                <section className="ed-panel">
                  <h2>Tags</h2>
                  <label className="ed-field">
                    <span>Comma-separated, up to ten</span>
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={set}
                      placeholder="visas, canada, ielts"
                    />
                  </label>
                  {form.tags.trim() ? (
                    <ul className="ed-tags">
                      {form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                    </ul>
                  ) : null}
                  <p className="ed-hint">
                    Tags become filters on the blog, and decide which articles
                    are suggested at the foot of this one.
                  </p>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
