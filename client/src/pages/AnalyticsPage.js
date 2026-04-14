import { useEffect, useMemo, useState } from "react";
import { analyticsApi, parseError, sessionApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analyticsData, sessionData] = await Promise.all([
          analyticsApi.getByUser(user.id),
          sessionApi.list(),
        ]);

        setAnalytics(analyticsData.analytics || []);
        setSummary(analyticsData.summary || null);
        setSessions(sessionData.filter((item) => item.completed));
      } catch (err) {
        setError(parseError(err, "Failed to load analytics"));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      load();
    }
  }, [user]);

  const stageAccuracy = useMemo(() => {
    const stageMap = {};

    sessions.forEach((session) => {
      (session.results || []).forEach((result) => {
        if (!stageMap[result.stage]) {
          stageMap[result.stage] = { correct: 0, total: 0 };
        }
        stageMap[result.stage].total += 1;
        if (result.correct) {
          stageMap[result.stage].correct += 1;
        }
      });
    });

    return Object.entries(stageMap)
      .map(([stage, value]) => ({
        stage,
        accuracy: value.total
          ? Math.round((value.correct / value.total) * 100)
          : 0,
      }))
      .sort((a, b) => a.stage.localeCompare(b.stage));
  }, [sessions]);

  return (
    <section className="stack-lg">
      <div className="card">
        <h2>Learning Analytics</h2>
        <p>
          Track outcomes, stage-level performance, and progress trends across
          sessions.
        </p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading && <p className="helper-text">Loading analytics...</p>}

      <div className="stats-grid">
        <article className="stat-card">
          <p>Total Sessions</p>
          <strong>{summary?.totalSessions ?? 0}</strong>
        </article>
        <article className="stat-card">
          <p>Total Words</p>
          <strong>{summary?.totalWords ?? 0}</strong>
        </article>
        <article className="stat-card">
          <p>Average Accuracy</p>
          <strong>{summary?.averageAccuracy ?? 0}%</strong>
        </article>
        <article className="stat-card">
          <p>Average Improvement</p>
          <strong>{summary?.averageImprovement ?? 0}%</strong>
        </article>
      </div>

      <div className="card">
        <h3>Stage Accuracy Breakdown</h3>
        {stageAccuracy.length === 0 ? (
          <p>No completed stage data yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {stageAccuracy.map((item) => (
                  <tr key={item.stage}>
                    <td>{item.stage}</td>
                    <td>{item.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Recent Analytics Entries</h3>
        {analytics.length === 0 ? (
          <p>
            No analytics entries yet. Complete a learning session to generate
            one.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Words Learned</th>
                  <th>Accuracy Rate</th>
                  <th>Avg Time/Word</th>
                </tr>
              </thead>
              <tbody>
                {analytics.slice(0, 12).map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.metrics?.wordsLearned || 0}</td>
                    <td>{item.metrics?.accuracyRate || 0}%</td>
                    <td>{item.metrics?.averageTimePerWord || 0}s</td>
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

export default AnalyticsPage;
