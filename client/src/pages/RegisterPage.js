import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pendingMsg, setPendingMsg] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "child",
  });

  const onChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await register(formData);
      // Teacher accounts return { pending: true } — no token issued
      if (result?.pending) {
        setPendingApproval(true);
        setPendingMsg(result.message);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pending approval screen
  if (pendingApproval) {
    return (
      <div className="auth-layout">
        <section className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>⏳</div>
          <h2>Account Pending Approval</h2>
          <p style={{ marginTop: "0.4rem" }}>{pendingMsg}</p>
          <div
            className="pending-notice"
            style={{ marginTop: "1rem" }}
          >
            <p>📧 An admin will review your request and activate your account.</p>
            <p style={{ marginTop: "0.4rem" }}>Once approved, you can log in normally.</p>
          </div>
          <Link className="btn btn-ghost" to="/login" style={{ marginTop: "1rem", display: "inline-block" }}>
            Back to Login
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <h2>Create Account</h2>
        <p>Set up a child, teacher, or admin profile.</p>

        {formData.role === "teacher" && (
          <div className="pending-notice">
            <strong>⚠️ Teacher accounts require admin approval.</strong>
            <p style={{ marginTop: "0.3rem", fontSize: "0.9rem" }}>
              After registering, your account will be inactive until an administrator activates it.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="stack-md">
          <label>
            Username
            <input
              name="username"
              required
              minLength={3}
              value={formData.username}
              onChange={onChange}
              placeholder="e.g., alex_learner"
            />
          </label>

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
              minLength={6}
              required
              value={formData.password}
              onChange={onChange}
              placeholder="At least 6 characters"
            />
          </label>

          <label>
            Role
            <select name="role" value={formData.role} onChange={onChange}>
              <option value="child">Child (Student)</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            disabled={isSubmitting}
            className="btn btn-primary"
            type="submit"
          >
            {isSubmitting
              ? "Creating account…"
              : formData.role === "teacher"
              ? "Register (Pending Approval)"
              : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
