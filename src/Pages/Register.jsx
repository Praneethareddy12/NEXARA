import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match!");
    }
    try {
      await api.post("/api/auth/register", {
        email: form.email,
        password: form.password,
      });
      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="back-to-signin">
          <Link to="/login">
            <span className="arrow-icon">←</span> Back to sign in
          </Link>
        </div>

        <h1 className="register-main-title">Create your account</h1>

        <form onSubmit={handleRegister}>
          <div className="form-group-centered">
            <label>Email</label>
            <div className="input-icon-wrapper">
              <span className="icon">✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group-centered">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Min. 8 characters"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group-centered">
            <label>Confirm Password</label>
            <div className="input-icon-wrapper">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Re-enter password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="signin-btn-main">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}