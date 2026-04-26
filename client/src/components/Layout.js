import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            AT
          </div>
          <div className="brand-copy">
            <h1 className="brand-title">ASD Animated Tutor</h1>
            <p className="brand-subtitle">
              Personalized word learning through adaptive stages
            </p>
          </div>
        </div>
        <div className="header-user-block">
          <span className="role-chip">{user?.role || "child"}</span>
          <button className="btn btn-ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="top-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/learning">Learning</NavLink>
        {(user?.role === "teacher" || user?.role === "admin") && (
          <NavLink to="/words">Words</NavLink>
        )}
        <NavLink to="/analytics">Analytics</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
