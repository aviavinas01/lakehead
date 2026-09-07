import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../api/client";
import { clearPassMark, passLeft } from "../../lib/gatePass";

/**
 * The sign-in form, plus the sentence the server refuses to say.
 *
 * `POST /auth/login` is unreachable without a gate pass, and a missing or
 * expired pass is answered with the SAME "Invalid email or password" as a
 * wrong password — deliberately, so a probe cannot map the door. The cost
 * falls on the one person the door is not for: the admin, who is told their
 * password is wrong when the real answer is "the pass ran out ten minutes
 * ago, go and open the door again".
 *
 * So the page keeps its own note of when the pass expires (see gatePass) and
 * says so. It NEVER disables the form on the strength of that note: the note
 * lives in sessionStorage, which comes back empty in some private modes, and
 * refusing to let a legitimate admin even try would be a worse failure than
 * the confusing message it replaces. The server remains the only authority.
 */

/** How often to re-check, so a pass expiring on this page is noticed. */
const TICK = 15_000;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(passLeft);

  /* The pass can lapse while the form sits open — which is exactly how this
     goes wrong in practice: open the door, get distracted, come back and be
     told the password is wrong. */
  useEffect(() => {
    const t = setInterval(() => setLeft(passLeft()), TICK);
    return () => clearInterval(t);
  }, []);

  const submit = async () => {
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
    <div className="admin-login container section">
      <div className="card form" style={{ maxWidth: 400, margin: "0 auto" }}>
        <h1>Admin login</h1>

        {left === 0 ? (
          <p className="form-note" role="status">
            This page has to be opened through the footer, and that access
            lasts ten minutes. Yours has expired or was never granted, so a
            sign-in here will be refused whatever you type.{" "}
            <Link to="/">Go back to the site</Link> and open the door again.
          </p>
        ) : null}

        <label>
          Email
          <input
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {error && <p className="form-error">{error}</p>}
        {left > 0 && !error ? (
          <p className="form-hint">
            Access expires in {minutes} minute{minutes === 1 ? "" : "s"}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
