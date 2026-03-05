import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });

      // Clear any potential stale session data
      localStorage.removeItem("token");

      alert("Password reset successful! Please login with your new password.");
      navigate("/"); // Redirect to the main login page
    } catch (error) {
      alert(error.response?.data?.message || "Invalid or expired reset link");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Set New Password</h1>
        <p className="login-subtitle">Choose a strong password you'll remember</p>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="signin-btn-main" onClick={handleReset}>
          Update Password
        </button>
      </div>
    </div>
  );
}