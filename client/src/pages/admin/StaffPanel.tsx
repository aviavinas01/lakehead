import { useEffect, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api/client";
import {
  createStaff,
  deleteStaff,
  fetchAllStaff,
  updateStaff,
  type StaffInput,
} from "../../api/people";
import { mediaSrc } from "../../api/media";
import ImagePicker from "./ImagePicker";
import type { StaffMember } from "../../types/api";

/**
 * The team, as cards on /about.
 *
 * Add at the top, edit in place, reorder with the arrows. The same shape as
 * the events and news panels next door, because it is the same job and
 * somebody who has learnt one should not have to learn another.
 *
 * ORDER IS A NUMBER YOU NUDGE, NOT A DRAG HANDLE. Dragging needs pointer
 * maths, a keyboard equivalent to be usable at all, and an answer for what
 * happens on a phone; two arrows need none of that, and this is a list of a
 * dozen people reordered once a year. Moving a card swaps its `order` with
 * its neighbour's, so the two saves are independent and a failure leaves the
 * list in a state that still makes sense.
 *
 * THE QUOTE IS OPTIONAL and the card is built to look right without one.
 * Half a team will not want to be quoted, and a grid where three cards have
 * a sentence and three have a gap is worse than a grid with none.
 */

interface Draft {
  name: string;
  title: string;
  photo: string;
  quote: string;
}

const EMPTY: Draft = { name: "", title: "", photo: "", quote: "" };

const draftFrom = (m: StaffMember): Draft => ({
  name: m.name,
  title: m.title,
  photo: m.photo ?? "",
  quote: m.quote ?? "",
});

/* Empty strings go through as empty strings — that is how a field already
   saved gets cleared. See server/utils/patch. */
const toInput = (d: Draft): StaffInput => ({
  name: d.name.trim(),
  title: d.title.trim(),
  photo: d.photo.trim(),
  quote: d.quote.trim(),
});

function Fields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
}) {
  const set = (k: keyof Draft) => (v: string) => onChange({ ...draft, [k]: v });
  return (
    <div className="hap-fields ppl-fields">
      <div className="hap-wide">
        <ImagePicker value={draft.photo} onChange={set("photo")} label="Photograph" />
      </div>
      <label>
        <span className="hap-label">Name</span>
        <input
          value={draft.name}
          onChange={(e) => set("name")(e.target.value)}
          required
          maxLength={120}
        />
      </label>
      <label>
        <span className="hap-label">Title</span>
        <input
          value={draft.title}
          onChange={(e) => set("title")(e.target.value)}
          required
          maxLength={160}
          placeholder="Senior Counsellor"
        />
      </label>
      <label className="hap-wide">
        <span className="hap-label">Their line (optional)</span>
        <textarea
          value={draft.quote}
          onChange={(e) => set("quote")(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="One sentence in their own words."
        />
      </label>
    </div>
  );
}

export default function StaffPanel() {
  const [items, setItems] = useState<StaffMember[] | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setItems(await fetchAllStaff());
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
      /* Added to the end: a new colleague joins the bottom of a team that
         has been put in a deliberate order, rather than jumping the queue. */
      const last = items?.length ? Math.max(...items.map((m) => m.order)) : 0;
      await createStaff({ ...toInput(draft), order: last + 1 });
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
      await updateStaff(id, toInput(editDraft));
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (m: StaffMember) => {
    setBusy(true);
    setError("");
    try {
      await updateStaff(m._id, { published: !m.published });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: StaffMember) => {
    if (!window.confirm(`Remove ${m.name} from the team page?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteStaff(m._id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /* Swaps this card's rank with its neighbour's. Two independent saves, so a
     failure on the second leaves an order that is still coherent rather than
     two people sharing a position. */
  const move = async (index: number, by: -1 | 1) => {
    if (!items) return;
    const a = items[index];
    const b = items[index + by];
    if (!a || !b) return;
    setBusy(true);
    setError("");
    try {
      await updateStaff(a._id, { order: b.order });
      await updateStaff(b._id, { order: a.order });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}

      <form className="adm-card ppl-form" onSubmit={add}>
        <h2 className="ppl-h2">Add someone</h2>
        <Fields draft={draft} onChange={setDraft} />
        <div className="ppl-actions">
          <button className="adm-btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add to the team"}
          </button>
        </div>
      </form>

      <section className="adm-card">
        <div className="adm-card-head">
          <h2>The team</h2>
          <span className="adm-quiet">
            {items ? `${items.length} ${items.length === 1 ? "person" : "people"}` : ""}
          </span>
        </div>

        {!items ? (
          <p className="adm-quiet">Loading…</p>
        ) : items.length === 0 ? (
          <p className="adm-quiet">
            Nobody added yet. The team section stays off the About page until
            somebody is.
          </p>
        ) : (
          <ul className="ppl-list">
            {items.map((m, i) => (
              <li key={m._id} className={m.published ? undefined : "is-off"}>
                {editing === m._id ? (
                  <div className="ppl-editing">
                    <Fields draft={editDraft} onChange={setEditDraft} />
                    <div className="ppl-actions">
                      <button
                        className="adm-btn"
                        type="button"
                        onClick={() => void save(m._id)}
                        disabled={busy}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-small"
                        type="button"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ppl-row">
                    <span className="ppl-thumb" aria-hidden="true">
                      {m.photo ? <img src={mediaSrc(m.photo)} alt="" /> : null}
                    </span>
                    <div className="ppl-row-copy">
                      <strong>{m.name}</strong>
                      <span className="ppl-role">{m.title}</span>
                      {m.quote ? <p className="ppl-row-quote">&ldquo;{m.quote}&rdquo;</p> : null}
                    </div>
                    <div className="ppl-row-tools">
                      <button
                        type="button"
                        title="Move up"
                        aria-label={`Move ${m.name} up`}
                        onClick={() => void move(i, -1)}
                        disabled={busy || i === 0}
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        aria-label={`Move ${m.name} down`}
                        onClick={() => void move(i, 1)}
                        disabled={busy || i === items.length - 1}
                      >
                        &darr;
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(m._id);
                          setEditDraft(draftFrom(m));
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => void toggle(m)} disabled={busy}>
                        {m.published ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        className="link-danger"
                        onClick={() => void remove(m)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
