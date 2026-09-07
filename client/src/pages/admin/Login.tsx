import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../api/client";
import { clearPassMark, passLeft } from "../../lib/gatePass";

/**
 * The sign-in screen: a centred form on the left, the hero film on the right.
 *
 * It is the only admin page a signed-out person ever sees, so it is the only
 * one that carries the brand. Everything past it is a tool and looks like one.
 *
 * ------------------------------------------------------------------
 * IT ALSO SAYS THE SENTENCE THE SERVER REFUSES TO.
 *
 * `POST /auth/login` is unreachable without a gate pass, and a missing or
 * expired pass is answered with the SAME "Invalid email or password" as a
 * wrong password — deliberately, so a probe cannot map the door. The cost
 * falls on the one person the door is not for: the admin, told their password
 * is wrong when the real answer is "the pass ran out ten minutes ago".
 *
 * So the page keeps its own note of when the pass expires (see gatePass) and
 * says so before anything is typed. It NEVER disables the form on the
 * strength of that note: the note lives in sessionStorage, which comes back
 * empty in some private modes, and refusing to let a legitimate admin even
 * try would be a worse failure than the confusing message it replaces. The
 * server remains the only authority.
 * ------------------------------------------------------------------
 */

/** How often to re-check, so a pass expiring on this page is noticed. */
const TICK = 15_000;

/** The home page's hero clip, reused. Decoration — muted, looping, silent. */
const FILM = "/hero.mp4";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(passLeft);
  const [filmBroken, setFilmBroken] = useState(false);

  /* The pass can lapse while the form sits open — which is exactly how this
     goes wrong in practice: open the door, get distracted, come back and be
     told the password is wrong. */
  useEffect(() => {
    const t = setInterval(() => setLeft(passLeft()), TICK);
    return () => clearInterval(t);
  }, []);

  /* A form, so Enter submits from either field. */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      /* The server spends the pass on a successful sign-in, so the note has
         to go with it — otherwise coming back here later would claim a pass
         that no longer exists. */
      clearPassMark();
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
      setLeft(passLeft());
    } finally {
      setBusy(false);
    }
  };

  const minutes = Math.ceil(left / 60_000);

  return (
    <div className="alog">
      <section className="alog-panel">
        {/* The mark doubles as the way out, for anyone who arrived here by
            accident or whose pass has expired and needs the footer again. */}
        <Link to="/" className="alog-brand" aria-label="Lakehead Education">
          <img src="/logo.png" alt="Lakehead Education" />
        </Link>

        <form className="alog-form" onSubmit={submit}>
          <h1>Welcome back</h1>
          <p className="alog-sub">Sign in to manage the site.</p>

          {left === 0 ? (
            <p className="alog-note" role="status">
              This page has to be opened through the footer, and that access
              lasts ten minutes. Yours has expired or was never granted, so a
              sign-in here will be refused whatever you type.{" "}
              <Link to="/">Go back to the site</Link> and open the door again.
            </p>
          ) : null}

          <label className="alog-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="username"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="alog-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="alog-go" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          {error ? <p className="alog-error" role="alert">{error}</p> : null}
          {left > 0 && !error ? (
            <p className="alog-hint">
              Access expires in {minutes} minute{minutes === 1 ? "" : "s"}.
            </p>
          ) : null}
        </form>
      </section>

      {/* Decoration, and marked as such: it carries no information, so a
          screen reader should walk straight past it to the form. */}
      <aside className="alog-film" aria-hidden="true">
        {filmBroken ? null : (
          <video
            src={FILM}
            autoPlay
            muted
            loop
            playsInline
            /* Metadata only up front. The clip is large and the form must be
               usable long before any of it has arrived. */
            preload="metadata"
            onError={() => setFilmBroken(true)}
          />
        )}
      </aside>
    </div>
  );
}
