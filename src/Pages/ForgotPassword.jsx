import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetRequest = async () => {
    try {
      // Ensure this endpoint exists on your backend
      await api.post("/api/auth/forgot-password", { email });
      setMessage("Reset link sent! Check your email.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-circle">
          <span className="sparkle-icon">🔑</span>
        </div>

        <h1>Reset Password</h1>
        <p className="login-subtitle">Enter your email to receive a reset link</p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {message && <p style={{ color: "#4834d4", fontSize: "14px", fontWeight: "600", marginBottom: "15px" }}>{message}</p>}

        <button className="signin-btn-main" onClick={handleResetRequest}>
          Send Reset Link
        </button>

        <div className="login-footer" style={{ justifyContent: "center" }}>
          <p className="signup-link">
            Remember your password? <Link to="/">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}