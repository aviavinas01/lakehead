import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import api, { getErrorMessage } from "../../api/client";
import AdminNav from "./AdminNav";
import type { User, UserRole } from "../../types/api";

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const initial: NewUserForm = { name: "", email: "", password: "", role: "editor" };

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [form, setForm] = useState<NewUserForm>(initial);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get<{ users: User[] }>("/users").then((res) => setUsers(res.data.users));
  }, []);

  useEffect(load, [load]);

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const create = async () => {
    setError("");
    try {
      await api.post("/users", form);
      setForm(initial);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create user"));
    }
  };

  const toggleActive = async (u: User) => {
    await api.patch(`/users/${u.id}`, { active: !u.active });
    load();
  };

  return (
    <>
      <AdminNav />
      <div className="container section">
        <h1>Team members</h1>
        <div className="card form" style={{ maxWidth: 560, marginBottom: "2rem" }}>
          <h3>Add a team member</h3>
          <label>Name<input name="name" value={form.name} onChange={set} /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={set} /></label>
          <label>Password (min 8 chars)
            <input type="password" name="password" value={form.password} onChange={set} />
          </label>
          <label>Role
            <select name="role" value={form.role} onChange={set}>
              <option value="editor">Editor (manage posts & inquiries)</option>
              <option value="admin">Admin (full control)</option>
            </select>
          </label>
          <button className="btn btn-primary" onClick={create}>Add user</button>
          {error && <p className="form-error">{error}</p>}
        </div>

        {!users ? (
          <p>Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge badge-${u.active ? "published" : "closed"}`}>
                      {u.active ? "active" : "disabled"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-small" onClick={() => toggleActive(u)}>
                      {u.active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
