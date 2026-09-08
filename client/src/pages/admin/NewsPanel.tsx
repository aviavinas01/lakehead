import { useEffect, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api/client";
import {
  createNews,
  deleteNews,
  fetchAllNews,
  updateNews,
  type NewsInput,
  type NewsItem,
} from "../../api/happenings";
import { mediaSrc } from "../../api/media";
import { formatDay, fromInput, hostOf, toDateInput } from "../../lib/datetime";
import ImagePicker from "./ImagePicker";

/**
 * News, curated.
 *
 * A card here is a POINTER to an article somebody else published — a visa
 * rule change, an intake announcement, a partner university in the papers.
 * The link goes to them; what is stored is only what makes the card worth
 * clicking.
 *
 * NOTHING IS READ FROM THE ADDRESS. Lifting the headline and picture out of
 * the page would save typing and would also mean the server fetches whatever
 * URL it is handed, which needs an allow-list, a redirect cap, a timeout and
 * a private-address block before it is safe. Four fields, pasted, cost less.
 * The picture especially is usually the publication's own photograph, so
 * pasting its address rather than re-hosting it is also the right side of
 * somebody else's copyright.
 */

interface Draft {
  title: string;
  url: string;
  image: string;
  summary: string;
  source: string;
  /** "YYYY-MM-DD" — the article's own date, not ours. */
  publishedAt: string;
}

const EMPTY: Draft = {
  title: "",
  url: "",
  image: "",
  summary: "",
  source: "",
  publishedAt: "",
};

const draftFrom = (n: NewsItem): Draft => ({
  title: n.title,
  url: n.url,
  image: n.image ?? "",
  summary: n.summary,
  source: n.source ?? "",
  publishedAt: toDateInput(n.publishedAt),
});

/* Empty strings go through as empty strings — that is how a field already
   saved gets cleared. See server/utils/patch. */
const toInput = (d: Draft): NewsInput => ({
  title: d.title.trim(),
  url: d.url.trim(),
  image: d.image.trim(),
  summary: d.summary.trim(),
  source: d.source.trim(),
  publishedAt: fromInput(d.publishedAt),
});

export default function NewsPanel() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setItems(await fetchAllNews());
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await createNews(toInput(draft));
      setDraft(EMPTY);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const save = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      await updateNews(id, toInput(editDraft));
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, input: NewsInput) => {
    setError("");
    try {
      await updateNews(id, input);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Remove “${title}” from the news section?`)) return;
    setError("");
    try {
      await deleteNews(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const ready = draft.title.trim() && draft.url.trim() && draft.summary.trim();

  return (
    <>
      <p className="admin-lead">
        Links to articles published elsewhere. Paste the address, write a line
        saying why it matters to a Lakehead student, and add a picture — either
        the publication&rsquo;s own (paste its address) or one of ours. Unlike
        events, a link goes live as soon as it is saved.
      </p>

      <form className="hap-form" onSubmit={add}>
        <h2 className="hap-form-title">Add a link</h2>
        <NewsFields value={draft} onChange={setDraft} />
        <div className="hap-form-actions">
          <button type="submit" disabled={busy || !ready}>
            {busy ? "Saving…" : "Add to news"}
          </button>
        </div>
      </form>

      {error ? <p className="form-error" role="status">{error}</p> : null}

      {items === null ? (
        <p className="admin-lead">Loading…</p>
      ) : items.length === 0 ? (
        <p className="admin-lead">
          No links yet. The news section stays hidden until there is at least
          one published item, so nothing looks broken in the meantime.
        </p>
      ) : (
        <ul className="hap-list">
          {items.map((n) =>
            editing === n._id ? (
              <li className="hap-item hap-item-editing" key={n._id}>
                <NewsFields value={editDraft} onChange={setEditDraft} />
                <div className="hap-form-actions">
                  <button type="button" onClick={() => void save(n._id)} disabled={busy}>
                    {busy ? "Saving…" : "Save changes"}
                  </button>
                  <button type="button" className="hap-quiet" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </li>
            ) : (
              <li className="hap-item" key={n._id} data-off={!n.published || undefined}>
                <span className="hap-thumb" aria-hidden="true">
                  {n.image ? <img src={mediaSrc(n.image)} alt="" loading="lazy" /> : null}
                </span>

                <span className="hap-body">
                  <strong className="hap-name">{n.title}</strong>
                  <span className="hap-meta">
                    {n.source ? <span>{n.source}</span> : null}
                    {n.publishedAt ? <span>{formatDay(n.publishedAt)}</span> : null}
                    {/* The link itself, so a wrong address is obvious here
                        rather than after somebody clicks it on the site. */}
                    <a href={n.url} target="_blank" rel="noreferrer noopener">
                      {hostOf(n.url) || n.url}
                    </a>
                    {!n.published ? <span className="hap-draft">Hidden</span> : null}
                  </span>
                  <span className="hap-blurb">{n.summary}</span>
                </span>

                <span className="hap-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditDraft(draftFrom(n));
                      setEditing(n._id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void patch(n._id, { published: !n.published })}
                  >
                    {n.published ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    className="hap-del"
                    onClick={() => void remove(n._id, n.title)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            )
          )}
        </ul>
      )}
    </>
  );
}

/** Shared by "add" and "edit" so the two cannot drift apart. */
function NewsFields({
  value,
  onChange,
}: {
  value: Draft;
  onChange: (next: Draft) => void;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...value, ...patch });

  return (
    <div className="hap-fields">
      <label className="hap-wide">
        <span className="hap-label">Article address</span>
        <input
          type="url"
          value={value.url}
          onChange={(e) => set({ url: e.target.value })}
          placeholder="https://example.com/the-article"
        />
      </label>

      <label className="hap-wide">
        <span className="hap-label">Headline</span>
        <input
          type="text"
          value={value.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Australia raises the student visa savings requirement"
        />
      </label>

      <label className="hap-wide">
        <span className="hap-label">Why it matters</span>
        <textarea
          rows={3}
          value={value.summary}
          onChange={(e) => set({ summary: e.target.value })}
          placeholder="The figure rises from May. What it means for offers already made."
        />
      </label>

      <label>
        <span className="hap-label">Published by</span>
        <input
          type="text"
          value={value.source}
          onChange={(e) => set({ source: e.target.value })}
          placeholder="The Kathmandu Post"
        />
      </label>

      <label>
        <span className="hap-label">Their publication date</span>
        <input
          type="date"
          value={value.publishedAt}
          onChange={(e) => set({ publishedAt: e.target.value })}
        />
      </label>

      <div className="hap-wide">
        <ImagePicker value={value.image} onChange={(image) => set({ image })} />
      </div>
    </div>
  );
}
