import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";

/**
 * The hidden door in the footer.
 *
 * Two clicks on the mark opens a prompt; the right code opens the sign-in
 * page. Nothing about it is visible, labelled or reachable by tabbing —
 * which is the point, and also its limit.
 *
 * ------------------------------------------------------------------
 * WHAT IT DOES AND DOES NOT DO. Hiding the sign-in page is obscurity. It
 * keeps bots and idle pokers off the form, which is worth having, but it is
 * NOT what protects the dashboard — the password is.
 *
 * What makes this more than decoration lives on the server: the code is
 * compared there (never here, where anyone could read it out of the bundle),
 * and passing it sets an httpOnly cookie that `POST /auth/login` REQUIRES. So
 * the sign-in endpoint is not merely hidden, it is unreachable without the
 * code — an attacker needs two secrets, and a credential-stuffing bot never
 * reaches the password check at all.
 *
 * This component therefore holds no secret and makes no decision. It collects
 * a string, posts it, and navigates if the server agreed.
 * ------------------------------------------------------------------
 */

/** How close together the two clicks have to be. */
const DOUBLE_MS = 400;

export default function GateDoor() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clicks = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const field = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  /* A plain click counter rather than `onDoubleClick`, so the mark stays an
     ordinary piece of artwork: no dblclick handler to notice in the
     inspector, and a single click does nothing at all. */
  const tap = () => {
    clicks.current += 1;
    window.clearTimeout(timer.current);
    if (clicks.current >= 2) {
      clicks.current = 0;
      setOpen(true);
      return;
    }
    timer.current = window.setTimeout(() => {
      clicks.current = 0;
    }, DOUBLE_MS);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* Escape closes it, and the field takes focus on open — it is a dialog
     even if it arrived by a secret handshake. */
  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    setCode("");
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/gate", { code: code.trim() });
      close();
      navigate("/admin/login");
    } catch (err) {
      /* Whatever the server said — wrong code, throttled — is shown as it
         came. It says the same thing for both on purpose. */
      setError(getErrorMessage(err, "That did not work."));
      setCode("");
      field.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* The mark itself. `aria-hidden` and not focusable: it is decoration
          that happens to listen, and announcing it to a screen reader would
          be announcing the door. */}
      <span className="gate-mark" onClick={tap} aria-hidden="true">
        <img src="/drawer-logo.png" alt="" />
      </span>

      {open ? (
        <div className="gate-veil" role="presentation" onClick={close}>
          <form
            className="gate-box"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-label="Restricted"
          >
            <input
              ref={field}
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code"
              aria-label="Code"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" disabled={busy || !code.trim()}>
              {busy ? "…" : "Enter"}
            </button>
            {error ? (
              <p className="gate-error" role="status">{error}</p>
            ) : null}
          </form>
        </div>
      ) : null}
    </>
  );
}
