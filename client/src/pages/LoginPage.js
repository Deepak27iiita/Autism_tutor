import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inactiveMsg, setInactiveMsg] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const redirectTo = location.state?.from?.pathname || "/dashboard";
  // Detect auto-logout redirect from API interceptor (?reason=inactive)
  const wasDeactivated = new URLSearchParams(location.search).get("reason") === "inactive";

  const onChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setInactiveMsg("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setInactiveMsg("");
    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Surface the ACCOUNT_INACTIVE message separately for clarity
      if (err?.message?.includes("pending") || err?.message?.includes("inactive")) {
        setInactiveMsg(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <h2>Welcome Back</h2>
        <p>Login to continue your learning journey.</p>

        {wasDeactivated && (
          <div className="pending-notice" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}>
            <strong>🔒 Account Deactivated</strong>
            Your account has been deactivated by an administrator. Please contact your admin to restore access.
          </div>
        )}

        {inactiveMsg && (
          <div className="pending-notice">
            <strong>⏳ Account Not Yet Active</strong>
            <p style={{ marginTop: "0.3rem", fontSize: "0.9rem" }}>{inactiveMsg}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="stack-md">
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={onChange}
              placeholder="name@example.com"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={onChange}
              placeholder="••••••••"
            />
          </label>

          {error && !inactiveMsg && <p className="error-text">{error}</p>}

          <button
            disabled={isSubmitting}
            className="btn btn-primary"
            type="submit"
          >
            {isSubmitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
