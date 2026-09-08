import { useRef, useState } from "react";
import { getErrorMessage } from "../../api/client";
import { uploadImage } from "../../api/happenings";
import { mediaSrc } from "../../api/media";

/**
 * Choose a picture: upload one, or paste the address of one that already
 * exists somewhere.
 *
 * BOTH, RATHER THAN EITHER. Uploading is what the office will do for an
 * event it is running. Pasting is what it will do for a news item, where the
 * picture belongs to the publication being linked to and re-hosting their
 * photograph is somebody else's copyright. One control does both because
 * the field underneath is one string either way.
 *
 * The value is held by the parent form — this only edits it.
 */
export default function ImagePicker({
  value,
  onChange,
  label = "Picture",
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const pick = async (chosen: File | undefined) => {
    if (!chosen) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(chosen));
    } catch (err) {
      setError(getErrorMessage(err, "That file could not be uploaded"));
    } finally {
      setBusy(false);
      /* Cleared so choosing the SAME file again still fires a change — the
         input keeps its value otherwise and the second attempt does nothing,
         which looks exactly like a failed upload. */
      if (file.current) file.current.value = "";
    }
  };

  return (
    <div className="hap-image">
      <span className="hap-label">{label}</span>

      <div className="hap-image-row">
        {/* The preview is the only reliable confirmation that a pasted
            address points at an image at all. */}
        <span className="hap-thumb" aria-hidden="true">
          {value ? <img src={mediaSrc(value)} alt="" /> : null}
        </span>

        <div className="hap-image-controls">
          <input
            type="text"
            value={value}
            placeholder="/uploads/… or https://…"
            aria-label={`${label} address`}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="hap-image-buttons">
            <button
              type="button"
              onClick={() => file.current?.click()}
              disabled={busy}
            >
              {busy ? "Uploading…" : "Upload a file"}
            </button>
            {value ? (
              <button type="button" className="hap-del" onClick={() => onChange("")}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={file}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
