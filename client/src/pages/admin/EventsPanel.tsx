import { useEffect, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api/client";
import {
  EVENT_KINDS,
  createEvent,
  deleteEvent,
  fetchAllEvents,
  updateEvent,
  type EventInput,
  type EventKind,
  type LakeheadEvent,
} from "../../api/happenings";
import { mediaSrc } from "../../api/media";
import { formatWhen, fromInput, toLocalInput } from "../../lib/datetime";
import ImagePicker from "./ImagePicker";

/**
 * Events, managed.
 *
 * Everything here is typed by the office — there is no feed to read and
 * nothing to go stale. A new event is a draft until somebody publishes it,
 * because an event gets written up before it is confirmed far more often
 * than the other way round.
 */

/** The form's own shape: every field a string, which is what inputs give. */
interface Draft {
  title: string;
  blurb: string;
  image: string;
  /** "YYYY-MM-DDTHH:mm", local — see lib/datetime. */
  startsAt: string;
  when: string;
  kind: string;
  where: string;
  registerUrl: string;
}

const EMPTY: Draft = {
  title: "",
  blurb: "",
  image: "",
  startsAt: "",
  when: "",
  kind: "",
  where: "",
  registerUrl: "",
};

const draftFrom = (e: LakeheadEvent): Draft => ({
  title: e.title,
  blurb: e.blurb,
  image: e.image ?? "",
  startsAt: toLocalInput(e.startsAt),
  when: e.when ?? "",
  kind: e.kind ?? "",
  where: e.where ?? "",
  registerUrl: e.registerUrl ?? "",
});

/* Empty strings are sent as empty strings, NOT dropped: that is how the
   server is told to clear a field it already has. See server/utils/patch. */
const toInput = (d: Draft): EventInput => ({
  title: d.title.trim(),
  blurb: d.blurb.trim(),
  image: d.image.trim(),
  startsAt: fromInput(d.startsAt),
  when: d.when.trim(),
  kind: (d.kind || undefined) as EventKind | undefined,
  where: d.where.trim(),
  registerUrl: d.registerUrl.trim(),
});

/** What the card will actually say, so the admin can see it before saving. */
const whenLabel = (e: LakeheadEvent) =>
  e.when || formatWhen(e.startsAt) || "No date set";

export default function EventsPanel() {
  const [items, setItems] = useState<LakeheadEvent[] | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setItems(await fetchAllEvents());
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
      await createEvent(toInput(draft));
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
      await updateEvent(id, toInput(editDraft));
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, input: EventInput) => {
    setError("");
    try {
      await updateEvent(id, input);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteEvent(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <p className="admin-lead">
        Everything on the <strong>/events</strong> page. A new event is saved
        as a draft — it appears on the site only once you press{" "}
        <strong>Publish</strong>. Give it a date and time, or write the timing
        out in words if it is not that precise; the words win when both are
        filled in.
      </p>

      <form className="hap-form" onSubmit={add}>
        <h2 className="hap-form-title">Add an event</h2>
        <EventFields value={draft} onChange={setDraft} />
        <div className="hap-form-actions">
          <button type="submit" disabled={busy || !draft.title.trim() || !draft.blurb.trim()}>
            {busy ? "Saving…" : "Save as draft"}
          </button>
        </div>
      </form>

      {error ? <p className="form-error" role="status">{error}</p> : null}

      {items === null ? (
        <p className="admin-lead">Loading…</p>
      ) : items.length === 0 ? (
        <p className="admin-lead">
          Nothing scheduled. The public page is built around this being the
          normal state — it explains what usually runs and how to hear about
          the next one, so an empty list is not a broken page.
        </p>
      ) : (
        <ul className="hap-list">
          {items.map((e) =>
            editing === e._id ? (
              <li className="hap-item hap-item-editing" key={e._id}>
                <EventFields value={editDraft} onChange={setEditDraft} />
                <div className="hap-form-actions">
                  <button type="button" onClick={() => void save(e._id)} disabled={busy}>
                    {busy ? "Saving…" : "Save changes"}
                  </button>
                  <button type="button" className="hap-quiet" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </li>
            ) : (
              <li className="hap-item" key={e._id} data-off={!e.published || undefined}>
                <span className="hap-thumb" aria-hidden="true">
                  {e.image ? <img src={mediaSrc(e.image)} alt="" loading="lazy" /> : null}
                </span>

                <span className="hap-body">
                  <strong className="hap-name">{e.title}</strong>
                  <span className="hap-meta">
                    <span>{whenLabel(e)}</span>
                    {e.kind ? <span>{e.kind}</span> : null}
                    {e.where ? <span>{e.where}</span> : null}
                    {!e.published ? <span className="hap-draft">Draft</span> : null}
                  </span>
                  <span className="hap-blurb">{e.blurb}</span>
                </span>

                <span className="hap-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditDraft(draftFrom(e));
                      setEditing(e._id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void patch(e._id, { published: !e.published })}
                  >
                    {e.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    className="hap-del"
                    onClick={() => void remove(e._id, e.title)}
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

/** The field set, shared by "add" and "edit" so the two cannot drift apart. */
function EventFields({
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
        <span className="hap-label">Title</span>
        <input
          type="text"
          value={value.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Australia information session"
        />
      </label>

      <label className="hap-wide">
        <span className="hap-label">Description</span>
        <textarea
          rows={3}
          value={value.blurb}
          onChange={(e) => set({ blurb: e.target.value })}
          placeholder="Entry requirements, real costs, work rights, and what the visa actually asks of you."
        />
      </label>

      <label>
        <span className="hap-label">Date and time</span>
        <input
          type="datetime-local"
          value={value.startsAt}
          onChange={(e) => set({ startsAt: e.target.value })}
        />
      </label>

      <label>
        <span className="hap-label">…or in words</span>
        <input
          type="text"
          value={value.when}
          onChange={(e) => set({ when: e.target.value })}
          placeholder="Late March"
        />
        <span className="hap-hint">Shown instead of the date above when filled in.</span>
      </label>

      <label>
        <span className="hap-label">Kind</span>
        <select value={value.kind} onChange={(e) => set({ kind: e.target.value })}>
          <option value="">—</option>
          {EVENT_KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </label>

      <label>
        <span className="hap-label">Where</span>
        <input
          type="text"
          value={value.where}
          onChange={(e) => set({ where: e.target.value })}
          placeholder="Kathmandu office, or Online"
        />
      </label>

      <label className="hap-wide">
        <span className="hap-label">Sign-up link</span>
        <input
          type="url"
          value={value.registerUrl}
          onChange={(e) => set({ registerUrl: e.target.value })}
          placeholder="https://… — leave empty to send people to the contact form"
        />
      </label>

      <div className="hap-wide">
        <ImagePicker value={value.image} onChange={(image) => set({ image })} />
      </div>
    </div>
  );
}
