import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const redirectTo = location.state?.from?.pathname || "/dashboard";

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
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <h2>Welcome Back</h2>
        <p>Login to continue your learning journey.</p>

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

          {error && <p className="error-text">{error}</p>}

          <button
            disabled={isSubmitting}
            className="btn btn-primary"
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Login"}
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
