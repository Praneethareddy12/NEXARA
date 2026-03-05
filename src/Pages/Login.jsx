import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("username"); // for Google login if sent

    if (token) {
      localStorage.setItem("token", token);

      if (username) {
        localStorage.setItem("username", username);
      }

      if (setIsLoggedIn) setIsLoggedIn(true);
      navigate("/dashboard", { replace: true });
    }
  }, [searchParams, navigate, setIsLoggedIn]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", form);

      // ✅ Store token
      localStorage.setItem("token", res.data.token);

      // ✅ Store username (IMPORTANT)
      if (res.data.user?.name) {
        localStorage.setItem("username", res.data.user.name);
      } else if (res.data.user?.username) {
        localStorage.setItem("username", res.data.user.username);
      } else {
        localStorage.setItem("username", form.email.split("@")[0]);
      }

      if (setIsLoggedIn) setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-circle">
          <span className="sparkle-icon">✨</span>
        </div>

        <h1>Welcome to Nexara</h1>

        <button
          type="button"
          className="google-btn-modern"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="G"
            width="20"
          />
          <span>Continue with Google</span>
        </button>

        <div className="divider-container">
          <div className="line"></div>
          <span className="or-text">OR</span>
          <div className="line"></div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="signin-btn-main">
            Sign in
          </button>
        </form>

        <div className="login-footer">
          <Link
            to="/forgot-password"
            style={{
              color: "#4f46e5",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Forgot password?
          </Link>

          <p className="signup-link">
            Need an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}