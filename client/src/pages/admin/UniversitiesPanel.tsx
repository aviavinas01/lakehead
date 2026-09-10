import { useEffect, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api/client";
import {
  createUniversity,
  deleteUniversity,
  fetchAllUniversities,
  updateUniversity,
  type UniversityInput,
} from "../../api/universities";
import { mediaSrc } from "../../api/media";
import { DESTINATIONS } from "../../data/universities";
import ImagePicker from "./ImagePicker";
import type { University, UniversityLink } from "../../types/api";

/**
 * The partner institutions.
 *
 * Add at the top, edit in place, reorder with the arrows — deliberately the
 * same shape as the staff and events panels next door, because it is the
 * same job and somebody who has learnt one should not have to learn another.
 * See StaffPanel for the reasoning behind the arrows rather than drag
 * handles, and behind swapping `order` with a neighbour rather than
 * renumbering the list.
 *
 * THE COUNTRY IS A SELECT, NOT A TEXT BOX, and that is the one place this
 * differs from its siblings in a way that matters. The public page groups
 * partners by country, counts them per destination and builds its filter
 * chips from the same field — all of which quietly fail if somebody types
 * "UK" where the slideshow says "United Kingdom", or "usa" where it says
 * "USA". A free-text field would put a spelling mistake between a partner
 * and the filter that is meant to find it. The options come from
 * DESTINATIONS, so the two can never drift.
 *
 * INTAKES AND LINKS ARE LISTS, edited as rows. Intakes are chips you toggle
 * because there are only ever twelve possible answers and typing them invites
 * "Sept"/"September"/"09". Links are free rows because nobody can predict
 * what an institution will want linked.
 */

/** The months an intake can start. Toggled, never typed — see above. */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Draft {
  name: string;
  logo: string;
  country: string;
  city: string;
  website: string;
  intakes: string[];
  links: UniversityLink[];
}

const EMPTY: Draft = {
  name: "",
  logo: "",
  country: "",
  city: "",
  website: "",
  intakes: [],
  links: [],
};

const draftFrom = (u: University): Draft => ({
  name: u.name,
  logo: u.logo,
  country: u.country ?? "",
  city: u.city ?? "",
  website: u.website ?? "",
  intakes: u.intakes ?? [],
  links: u.links ?? [],
});

/* Empty strings go through as empty strings — that is how a field already
   saved gets cleared. See server/src/utils/patch.ts.

   Link rows that are half-filled are dropped rather than sent: the server
   requires both halves and would reject the whole save, which would lose the
   other edits along with the blank row somebody left behind. */
const toInput = (d: Draft): UniversityInput => ({
  name: d.name.trim(),
  logo: d.logo.trim(),
  country: d.country.trim(),
  city: d.city.trim(),
  website: d.website.trim(),
  intakes: d.intakes,
  links: d.links
    .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
    .filter((l) => l.label !== "" && l.url !== ""),
});

function Fields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
}) {
  const set = <K extends keyof Draft>(k: K) => (v: Draft[K]) =>
    onChange({ ...draft, [k]: v });

  const toggleIntake = (month: string) =>
    set("intakes")(
      draft.intakes.includes(month)
        ? draft.intakes.filter((m) => m !== month)
        : /* Kept in calendar order however they were clicked, so the page
             never shows "September, January". */
          MONTHS.filter((m) => m === month || draft.intakes.includes(m))
    );

  const setLink = (i: number, patch: Partial<UniversityLink>) =>
    set("links")(draft.links.map((l, n) => (n === i ? { ...l, ...patch } : l)));

  return (
    <div className="hap-fields ppl-fields">
      <div className="hap-wide">
        <ImagePicker value={draft.logo} onChange={set("logo")} label="Logo" />
      </div>

      <label>
        <span className="hap-label">Name</span>
        <input
          value={draft.name}
          onChange={(e) => set("name")(e.target.value)}
          required
          maxLength={200}
          placeholder="Deakin University"
        />
      </label>

      <label>
        <span className="hap-label">Country</span>
        <select
          value={draft.country}
          onChange={(e) => set("country")(e.target.value)}
        >
          <option value="">— not set —</option>
          {DESTINATIONS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.display ?? d.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="hap-label">City (optional)</span>
        <input
          value={draft.city}
          onChange={(e) => set("city")(e.target.value)}
          maxLength={120}
          placeholder="Melbourne"
        />
      </label>

      <label>
        <span className="hap-label">Website (optional)</span>
        <input
          value={draft.website}
          onChange={(e) => set("website")(e.target.value)}
          maxLength={800}
          placeholder="https://…"
        />
      </label>

      <div className="hap-wide uni-adm-block">
        <span className="hap-label">Intakes (optional)</span>
        <div className="uni-adm-months">
          {MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              className={draft.intakes.includes(m) ? "is-on" : undefined}
              aria-pressed={draft.intakes.includes(m)}
              onClick={() => toggleIntake(m)}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="hap-wide uni-adm-block">
        <span className="hap-label">Links (optional)</span>
        {draft.links.length === 0 ? (
          <p className="adm-quiet uni-adm-none">
            Nothing linked yet — a prospectus, an apply page, a scholarships
            page.
          </p>
        ) : null}
        {draft.links.map((l, i) => (
          <div className="uni-adm-link" key={i}>
            <input
              value={l.label}
              onChange={(e) => setLink(i, { label: e.target.value })}
              maxLength={80}
              aria-label={`Link ${i + 1} label`}
              placeholder="Prospectus"
            />
            <input
              value={l.url}
              onChange={(e) => setLink(i, { url: e.target.value })}
              maxLength={800}
              aria-label={`Link ${i + 1} address`}
              placeholder="https://…"
            />
            <button
              type="button"
              className="link-danger"
              onClick={() => set("links")(draft.links.filter((_, n) => n !== i))}
              aria-label={`Remove link ${i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-small"
          onClick={() => set("links")([...draft.links, { label: "", url: "" }])}
        >
          + Add a link
        </button>
      </div>
    </div>
  );
}

export default function UniversitiesPanel() {
  const [items, setItems] = useState<University[] | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setItems(await fetchAllUniversities());
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
    if (!draft.logo.trim()) {
      setError("A logo is required — the partner wall is a wall of marks.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      /* Added to the end, so a new partner joins the bottom of a wall that
         has been put in a deliberate order. */
      const last = items?.length ? Math.max(...items.map((u) => u.order)) : 0;
      await createUniversity({ ...toInput(draft), order: last + 1 });
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
      await updateUniversity(id, toInput(editDraft));
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (u: University) => {
    setBusy(true);
    setError("");
    try {
      await updateUniversity(u._id, { published: !u.published });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u: University) => {
    if (!window.confirm(`Remove ${u.name} from the partners page?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteUniversity(u._id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /* Swaps this card's rank with its neighbour's — two independent saves, so
     a failure on the second leaves an order that still makes sense rather
     than two partners sharing a position. Same as StaffPanel. */
  const move = async (index: number, by: -1 | 1) => {
    if (!items) return;
    const a = items[index];
    const b = items[index + by];
    if (!a || !b) return;
    setBusy(true);
    setError("");
    try {
      await updateUniversity(a._id, { order: b.order });
      await updateUniversity(b._id, { order: a.order });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /* Named so the office can see at a glance which records are still thin —
     a partner with no country is missing from every filter chip and every
     per-destination count on the public page. */
  const unplaced = items?.filter((u) => !u.country).length ?? 0;

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}

      <form className="adm-card ppl-form" onSubmit={add}>
        <h2 className="ppl-h2">Add a university</h2>
        <Fields draft={draft} onChange={setDraft} />
        <div className="ppl-actions">
          <button className="adm-btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add to the partners page"}
          </button>
        </div>
      </form>

      <section className="adm-card">
        <div className="adm-card-head">
          <h2>Partner institutions</h2>
          <span className="adm-quiet">
            {items
              ? `${items.length} ${items.length === 1 ? "partner" : "partners"}`
              : ""}
          </span>
        </div>

        {unplaced > 0 ? (
          <p className="adm-quiet uni-adm-warn">
            {unplaced} {unplaced === 1 ? "partner has" : "partners have"} no
            country set. They still appear on the wall, but they are left out
            of the destination filter and the per-country counts until one is
            chosen.
          </p>
        ) : null}

        {!items ? (
          <p className="adm-quiet">Loading…</p>
        ) : items.length === 0 ? (
          <p className="adm-quiet">
            No partners yet. The list on /university-partners shows its empty
            state until one is added.
          </p>
        ) : (
          <ul className="ppl-list">
            {items.map((u, i) => (
              <li key={u._id} className={u.published ? undefined : "is-off"}>
                {editing === u._id ? (
                  <div className="ppl-editing">
                    <Fields draft={editDraft} onChange={setEditDraft} />
                    <div className="ppl-actions">
                      <button
                        className="adm-btn"
                        type="button"
                        onClick={() => void save(u._id)}
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
                    <span className="ppl-thumb uni-adm-thumb" aria-hidden="true">
                      {u.logo ? <img src={mediaSrc(u.logo)} alt="" /> : null}
                    </span>
                    <div className="ppl-row-copy">
                      <strong>{u.name}</strong>
                      <span className="ppl-role">
                        {[u.city, u.country].filter(Boolean).join(", ") ||
                          "No location set"}
                      </span>
                      <span className="uni-adm-meta">
                        {u.intakes.length
                          ? `${u.intakes.length} intake${u.intakes.length === 1 ? "" : "s"}`
                          : "No intakes"}
                        {" · "}
                        {u.links.length
                          ? `${u.links.length} link${u.links.length === 1 ? "" : "s"}`
                          : "No links"}
                        {" · /university-partners/"}
                        {u.slug}
                      </span>
                    </div>
                    <div className="ppl-row-tools">
                      <button
                        type="button"
                        title="Move up"
                        aria-label={`Move ${u.name} up`}
                        onClick={() => void move(i, -1)}
                        disabled={busy || i === 0}
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        aria-label={`Move ${u.name} down`}
                        onClick={() => void move(i, 1)}
                        disabled={busy || i === items.length - 1}
                      >
                        &darr;
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(u._id);
                          setEditDraft(draftFrom(u));
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggle(u)}
                        disabled={busy}
                      >
                        {u.published ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        className="link-danger"
                        onClick={() => void remove(u)}
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
