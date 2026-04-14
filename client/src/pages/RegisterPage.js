import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <h2>Create Account</h2>
        <p>Set up a child, teacher, or admin profile.</p>

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
              <option value="child">Child</option>
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
            {isSubmitting ? "Creating account..." : "Register"}
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
