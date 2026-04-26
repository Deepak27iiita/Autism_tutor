import { useCallback, useEffect, useState } from "react";
import { adminApi, parseError } from "../services/api";

const ROLES = ["child", "teacher", "admin"];

const AdminPage = () => {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Assignment modal state
  const [showModal, setShowModal] = useState(false);
  const [selTeacher, setSelTeacher] = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [assigning, setAssigning] = useState(false);

  const teachers = users.filter((u) => u.role === "teacher");
  const students = users.filter((u) => u.role === "child");

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(""), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, s] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listAssignments(),
        adminApi.getStats(),
      ]);
      setUsers(u); setAssignments(a); setStats(s);
    } catch (err) {
      flash(parseError(err, "Failed to load data"), true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const changeRole = async (userId, role) => {
    try {
      const updated = await adminApi.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => u._id === updated._id ? updated : u));
      flash(`Role updated to ${role}`);
    } catch (err) { flash(parseError(err, "Failed to update role"), true); }
  };

  const toggleActive = async (userId, isActive) => {
    try {
      const updated = await adminApi.toggleActive(userId, isActive);
      setUsers((prev) => prev.map((u) => u._id === updated._id ? updated : u));
      flash(`Account ${isActive ? "activated" : "deactivated"}`);
    } catch (err) { flash(parseError(err, "Failed to update"), true); }
  };

  const handleAssign = async () => {
    if (!selTeacher || !selStudent) return;
    setAssigning(true);
    try {
      const a = await adminApi.assign(selTeacher, selStudent);
      setAssignments((prev) => [a, ...prev]);
      flash("Teacher assigned successfully!");
      setShowModal(false); setSelTeacher(""); setSelStudent("");
    } catch (err) { flash(parseError(err, "Assignment failed"), true); }
    finally { setAssigning(false); }
  };

  const removeAssignment = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await adminApi.unassign(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      flash("Assignment removed");
    } catch (err) { flash(parseError(err, "Failed to remove"), true); }
  };

  return (
    <section className="stack-lg">
      <div className="card hero-card">
        <h2>⚙️ Admin Panel</h2>
        <p>Manage users, roles, and teacher-student assignments.</p>
      </div>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      {stats && (
        <div className="stats-grid">
          {[["Total Users", stats.totalUsers], ["Teachers", stats.totalTeachers], ["Students", stats.totalStudents], ["Admins", stats.totalAdmins], ["Assignments", stats.totalAssignments]].map(([label, val]) => (
            <article key={label} className="stat-card"><p>{label}</p><strong>{val}</strong></article>
          ))}
        </div>
      )}

      <div className="tab-bar">
        {["users", "assignments"].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>
            {t === "users" ? "👥 Users" : "🔗 Assignments"}
          </button>
        ))}
      </div>

      {loading && <p className="helper-text">Loading…</p>}

      {tab === "users" && !loading && (
        <div className="card">
          <h3>All Users ({users.length})</h3>
          <div className="table-scroll" style={{ marginTop: "0.8rem" }}>
            <table className="data-table">
              <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <select className="role-select" value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td><span className={`status-chip ${u.isActive !== false ? "status-active" : "status-inactive"}`}>{u.isActive !== false ? "Active" : "Inactive"}</span></td>
                    <td>
                      <button className={`btn ${u.isActive !== false ? "btn-danger" : "btn-success"}`} style={{ fontSize: "0.78rem", padding: "0.35rem 0.6rem" }}
                        onClick={() => toggleActive(u._id, !(u.isActive !== false))}>
                        {u.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "assignments" && !loading && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
            <h3>Teacher → Student Assignments ({assignments.length})</h3>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Assignment</button>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Assign Teacher to Student</h3>
                <label>Teacher
                  <select value={selTeacher} onChange={(e) => setSelTeacher(e.target.value)}>
                    <option value="">— select teacher —</option>
                    {teachers.map((t) => <option key={t._id} value={t._id}>{t.username} ({t.email})</option>)}
                  </select>
                </label>
                <label style={{ marginTop: "0.6rem" }}>Student
                  <select value={selStudent} onChange={(e) => setSelStudent(e.target.value)}>
                    <option value="">— select student —</option>
                    {students.map((s) => <option key={s._id} value={s._id}>{s.username} ({s.email})</option>)}
                  </select>
                </label>
                <div className="row-wrap" style={{ marginTop: "1rem" }}>
                  <button className="btn btn-primary" disabled={!selTeacher || !selStudent || assigning} onClick={handleAssign}>{assigning ? "Assigning…" : "Assign"}</button>
                  <button className="btn btn-ghost" onClick={() => { setShowModal(false); setSelTeacher(""); setSelStudent(""); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="table-scroll" style={{ marginTop: "0.8rem" }}>
            <table className="data-table">
              <thead><tr><th>Teacher</th><th>Student</th><th>Assigned</th><th>Actions</th></tr></thead>
              <tbody>
                {assignments.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#94a3b8" }}>No assignments yet.</td></tr>}
                {assignments.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.teacherId?.username}</strong><br /><small>{a.teacherId?.email}</small></td>
                    <td>{a.studentId?.username}<br /><small>{a.studentId?.email}</small></td>
                    <td>{new Date(a.assignedAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-danger" style={{ fontSize: "0.78rem", padding: "0.35rem 0.6rem" }} onClick={() => removeAssignment(a._id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPage;
