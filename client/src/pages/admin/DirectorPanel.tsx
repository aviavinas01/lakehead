import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getErrorMessage } from "../../api/client";
import { fetchDirectorAdmin, saveDirector } from "../../api/people";
import ImagePicker from "./ImagePicker";
import { renderArticle, wordCount } from "../../lib/richText";
import { directorHeading } from "../../lib/people";

/**
 * The director's message — one photograph, one statement.
 *
 * A SINGLE FORM, NOT A LIST, because there is one director. The record is a
 * singleton on the server and saving upserts it, so this screen never has to
 * know whether it is creating or updating and there is no "add" button to
 * press exactly once.
 *
 * The statement is written in the same small markup as a blog post and drawn
 * by the SAME function the public page calls, so the preview is the page
 * rather than an approximation of it. Nothing is HTML at any point, so there
 * is nothing to sanitise — see lib/richText.
 *
 * PUBLISHING IS A DELIBERATE ACT. The record starts unpublished and the
 * toggle is beside the save button rather than implied by it: this is the
 * one page on the site where a half-written draft going live is genuinely
 * embarrassing.
 */

interface Draft {
  name: string;
  title: string;
  photo: string;
  lead: string;
  statement: string;
  published: boolean;
}

const EMPTY: Draft = {
  name: "",
  title: "",
  photo: "",
  lead: "",
  statement: "",
  published: false,
};

export default function DirectorPanel() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDirectorAdmin()
      .then((d) => {
        if (cancelled || !d) return;
        setDraft({
          name: d.name,
          title: d.title,
          photo: d.photo ?? "",
          lead: d.lead ?? "",
          statement: d.statement,
          published: d.published,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load the message"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setDraft((d) => ({ ...d, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await saveDirector({
        name: draft.name.trim(),
        title: draft.title.trim(),
        /* Empty strings go through as empty strings — that is how a photo or
           a lead line already saved gets cleared. See server/utils/patch. */
        photo: draft.photo.trim(),
        lead: draft.lead.trim(),
        statement: draft.statement,
        published: draft.published,
      });
      setNotice(draft.published ? "Saved and live." : "Saved. Not published yet.");
    } catch (err) {
      setError(getErrorMessage(err, "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="adm-quiet">Loading…</p>;

  const words = wordCount(draft.statement);

  return (
    <form className="adm-card ppl-form" onSubmit={submit}>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      <div className="ppl-split">
        <div className="ppl-side hap-fields">
          <ImagePicker
            value={draft.photo}
            onChange={(photo) => setDraft((d) => ({ ...d, photo }))}
            label="Photograph"
          />
          <p className="adm-quiet ppl-hint hap-wide">
            Shown large on the left, with the short statement beside it. A
            tall portrait works best. A cut-out on a transparent background
            (PNG) looks best of all — the angled block behind it then shows
            through, as in the design.
          </p>

          <label className="hap-wide">
            <span className="hap-label">Name</span>
            <input name="name" value={draft.name} onChange={set} required maxLength={120} />
          </label>

          <label className="hap-wide">
            <span className="hap-label">Title</span>
            <input
              name="title"
              value={draft.title}
              onChange={set}
              required
              maxLength={160}
              placeholder="Founder &amp; CEO, Lakehead Education"
            />
          </label>
          {/* The page headline is derived from this rather than typed
              separately, so it can never contradict the signature — see
              lib/people.ts. Shown live so nobody has to know the rule to
              predict the result. */}
          <p className="adm-quiet ppl-hint hap-wide">
            Headline will read:{" "}
            <strong className="ppl-derived">{directorHeading(draft.title)}</strong>
          </p>
        </div>

        <div className="ppl-main hap-fields">
          <label className="hap-wide">
            <span className="hap-label">Short statement — beside the photo</span>
            <textarea
              name="lead"
              value={draft.lead}
              onChange={set}
              rows={5}
              maxLength={700}
              placeholder="Three or four sentences. This is what a reader gets before they commit to the whole letter."
            />
          </label>
          <p className="adm-quiet ppl-hint hap-wide">
            {draft.lead.length}/700 &middot; sits to the right of the
            photograph, above the full message
          </p>

          <div className="ppl-statement-head hap-wide">
            <span className="hap-label">The full message — below the photo</span>
            <button
              type="button"
              className="btn btn-small"
              onClick={() => setPreview((p) => !p)}
              aria-pressed={preview}
            >
              {preview ? "Back to writing" : "Preview"}
            </button>
          </div>

          {preview ? (
            <div className="ppl-preview art-prose hap-wide">
              {draft.statement.trim()
                ? renderArticle(draft.statement)
                : <p className="adm-quiet">Nothing written yet.</p>}
            </div>
          ) : (
            <textarea
              className="ppl-area hap-wide"
              name="statement"
              value={draft.statement}
              onChange={set}
              rows={16}
              required
              maxLength={20000}
              placeholder={"Write the message here.\n\nA blank line starts a new paragraph. **bold** and *italic* work, as on the blog."}
            />
          )}
          <p className="adm-quiet ppl-hint hap-wide">
            {words} {words === 1 ? "word" : "words"} · a blank line starts a
            new paragraph
          </p>
        </div>
      </div>

      <div className="ppl-actions">
        <label className="ppl-check">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
          />
          <span>
            Show on the website
            <small>
              Off, the page tells visitors the message is coming shortly.
            </small>
          </span>
        </label>
        <button className="adm-btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save message"}
        </button>
      </div>
    </form>
  );
}
