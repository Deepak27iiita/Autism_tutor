import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi, parseError, sessionApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analyticsData, sessionsData] = await Promise.all([
          analyticsApi.getByUser(user.id),
          sessionApi.list(),
        ]);

        setSummary(analyticsData.summary);
        setSessions(sessionsData.slice(0, 6));
      } catch (err) {
        setError(parseError(err, "Failed to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      load();
    }
  }, [user]);

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.completed),
    [sessions],
  );

  return (
    <section className="stack-lg">
      <div className="card hero-card">
        <h2>Hi, {user?.username}</h2>
        <p>
          Continue your structured 8-stage learning flow and track progress
          across recognition, reading, spelling, and recall.
        </p>
        <div className="row-wrap">
          <Link className="btn btn-primary" to="/learning">
            Start Learning
          </Link>
          {(user?.role === "teacher" || user?.role === "admin") && (
            <Link className="btn btn-secondary" to="/words">
              Manage Words
            </Link>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading && <p className="helper-text">Loading dashboard...</p>}

      <div className="stats-grid">
        <article className="stat-card">
          <p>Total Sessions</p>
          <strong>{summary?.totalSessions ?? 0}</strong>
        </article>
        <article className="stat-card">
          <p>Words Practiced</p>
          <strong>{summary?.totalWords ?? 0}</strong>
        </article>
        <article className="stat-card">
          <p>Average Accuracy</p>
          <strong>{summary?.averageAccuracy ?? 0}%</strong>
        </article>
        <article className="stat-card">
          <p>Improvement</p>
          <strong>{summary?.averageImprovement ?? 0}%</strong>
        </article>
      </div>

      <div className="card">
        <h3>Recent Sessions</h3>
        {loading ? (
          <p className="helper-text">Loading recent sessions...</p>
        ) : completedSessions.length === 0 ? (
          <p>No completed sessions yet. Start one from the learning page.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Words</th>
                  <th>Duration</th>
                  <th>Post-Test</th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.map((session) => (
                  <tr key={session._id}>
                    <td>
                      {new Date(
                        session.completedAt || session.startedAt,
                      ).toLocaleDateString()}
                    </td>
                    <td>{session.sessionType}</td>
                    <td>{session.words?.length || 0}</td>
                    <td>{session.duration || 0}s</td>
                    <td>{session.postTestScore || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
