import { useCallback, useEffect, useState } from "react";
import { parseError, teacherApi } from "../services/api";

const TeacherPage = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(""), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await teacherApi.getStudents();
        setStudents(data);
      } catch (err) {
        flash(parseError(err, "Failed to load students"), true);
      } finally { setLoading(false); }
    })();
  }, []);

  const selectStudent = useCallback(async (student) => {
    setSelected(student);
    setProgress(null);
    setNotes(student.notes || "");
    setLoadingProgress(true);
    try {
      const data = await teacherApi.getStudentProgress(student._id);
      setProgress(data);
    } catch (err) {
      flash(parseError(err, "Failed to load progress"), true);
    } finally { setLoadingProgress(false); }
  }, []);

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await teacherApi.updateNotes(selected._id, notes);
      flash("Notes saved!");
    } catch (err) { flash(parseError(err, "Failed to save"), true); }
    finally { setSavingNotes(false); }
  };

  const mi = progress?.mlInsights;
  const mastery = mi?.predictedAccuracy ?? null;
  const masteryColor = mastery === null ? "#64748b" : mastery >= 75 ? "#047857" : mastery >= 50 ? "#b45309" : "#b91c1c";

  return (
    <section className="stack-lg">
      <div className="card hero-card"><h2>👩‍🏫 My Students</h2><p>Monitor progress, mastery scores, and personalise learning for each assigned student.</p></div>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      {loading && <p className="helper-text">Loading students…</p>}

      <div className="teacher-layout">
        {/* Student list */}
        <div className="card student-list-panel">
          <h3>Assigned Students ({students.length})</h3>
          {!loading && students.length === 0 && <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>No students assigned yet. Ask your admin.</p>}
          <div className="student-list">
            {students.map((s) => (
              <button key={s._id} className={`student-card-btn ${selected?._id === s._id ? "selected" : ""}`} onClick={() => selectStudent(s)}>
                <div className="student-avatar">{s.username[0].toUpperCase()}</div>
                <div>
                  <strong>{s.username}</strong>
                  <p style={{ fontSize: "0.82rem", color: "#64748b" }}>{s.email}</p>
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Last session: {s.learningStats?.lastSessionDate ? new Date(s.learningStats.lastSessionDate).toLocaleDateString() : "Never"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress panel */}
        <div className="card stack-md">
          {!selected && !loadingProgress && <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}><p style={{ fontSize: "2rem" }}>👈</p><p>Select a student to view their progress</p></div>}
          {loadingProgress && <p className="helper-text">Loading progress…</p>}
          {selected && progress && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <h3>{selected.username}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#64748b" }}>{selected.email} • {selected.role}</p>
                </div>
                <div className="mastery-badge" style={{ background: masteryColor + "18", color: masteryColor, borderColor: masteryColor + "44" }}>
                  {mastery !== null ? `${mastery}% Mastery` : "No data yet"}
                </div>
              </div>

              {/* Quick stats */}
              <div className="stats-grid">
                {[
                  ["Sessions", progress.sessions?.length ?? 0],
                  ["Rec. Intensity", mi?.recommendedAnimationIntensity ?? "—"],
                  ["Rec. Words/Session", mi?.recommendedSessionSize ?? "—"],
                  ["Tracked Words", mi?.observations?.trackedWords ?? 0],
                ].map(([lbl, val]) => (
                  <article key={lbl} className="stat-card"><p>{lbl}</p><strong>{val}</strong></article>
                ))}
              </div>

              {/* Weak words */}
              {mi?.weakWords?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: "0.5rem" }}>⚠️ Words Needing Attention</h4>
                  <div className="weak-word-list">
                    {mi.weakWords.slice(0, 6).map((w) => (
                      <div key={w.wordId} className="weak-word-chip" style={{ borderColor: w.mastery < 40 ? "#fecaca" : "#fde68a", background: w.mastery < 40 ? "#fef2f2" : "#fefce8" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>{w.wordId.slice(-6)}</span>
                        <span className="mastery-mini" style={{ color: w.mastery < 40 ? "#b91c1c" : "#b45309" }}>{w.mastery}%</span>
                        {w.trend === "declining" && <span title="Declining">📉</span>}
                        {w.daysSincePractice >= 7 && <span title="Overdue for review">⏰</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent sessions */}
              {progress.sessions?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: "0.4rem" }}>Recent Sessions</h4>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Date</th><th>Words</th><th>Pre</th><th>Post</th><th>Improvement</th></tr></thead>
                      <tbody>
                        {progress.sessions.slice(0, 8).map((s) => (
                          <tr key={s._id}>
                            <td>{new Date(s.completedAt || s.startedAt).toLocaleDateString()}</td>
                            <td>{s.words?.length ?? 0}</td>
                            <td>{s.preTestScore ?? 0}%</td>
                            <td>{s.postTestScore ?? 0}%</td>
                            <td style={{ color: (s.improvement ?? 0) >= 0 ? "#047857" : "#b91c1c", fontWeight: 700 }}>{(s.improvement ?? 0).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Teacher notes */}
              <div>
                <h4 style={{ marginBottom: "0.4rem" }}>📝 My Notes</h4>
                <textarea className="notes-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add observations, strategies, or notes for this student…" rows={4} />
                <button className="btn btn-secondary" style={{ marginTop: "0.4rem" }} disabled={savingNotes} onClick={saveNotes}>{savingNotes ? "Saving…" : "Save Notes"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TeacherPage;
