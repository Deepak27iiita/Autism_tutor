import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isChild = user?.role === "child";
  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const onLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">AT</div>
          <div className="brand-copy">
            <h1 className="brand-title">ASD Animated Tutor</h1>
            <p className="brand-subtitle">Personalised word learning through adaptive stages</p>
          </div>
        </div>
        <div className="header-user-block">
          <span className="role-chip">{user?.role || "child"}</span>
          <span className="helper-text" style={{ fontSize: "0.85rem" }}>{user?.username}</span>
          <button className="btn btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <nav className="top-nav">
        <NavLink to="/dashboard">📊 Dashboard</NavLink>

        {/* Learning is ONLY for child role */}
        {isChild && <NavLink to="/learning">🧠 Learning</NavLink>}

        <NavLink to="/analytics">📈 Analytics</NavLink>
        <NavLink to="/profile">⚙️ Profile</NavLink>

        {/* Words management — teacher & admin only */}
        {isTeacherOrAdmin && <NavLink to="/words">📚 Words</NavLink>}

        {/* My Students — teacher & admin only */}
        {isTeacherOrAdmin && <NavLink to="/teacher">👩‍🏫 My Students</NavLink>}

        {/* Admin panel — admin only */}
        {isAdmin && <NavLink to="/admin">🔧 Admin</NavLink>}
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
