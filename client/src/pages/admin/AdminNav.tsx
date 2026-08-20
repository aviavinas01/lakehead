import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <header className="navbar admin-nav">
      <div className="container navbar-inner">
        <Link to="/admin" className="brand">Lakehead Admin</Link>
        <nav className="nav-links open">
          <Link to="/admin">Posts</Link>
          <Link to="/admin/media">Media</Link>
          <Link to="/admin/inquiries">Inquiries</Link>
          {user?.role === "admin" && <Link to="/admin/users">Users</Link>}
          <Link to="/" target="_blank">View site</Link>
          <span className="admin-user">{user?.name}</span>
          <button className="btn btn-small" onClick={handleLogout}>Log out</button>
        </nav>
      </div>
    </header>
  );
}
