import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setLevel(res.data.level || 1);
      } catch (err) {
        console.error("Failed to fetch level");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-logo">✨ Nexara</div>

        <div className="nav-menu">
          <Link to="/home" className={isActive("/home")}>🏠 Home</Link>
          <Link to="/dashboard" className={isActive("/dashboard")}>📊 Dashboard</Link>
          <Link to="/paths" className={isActive("/paths")}>📖 Learning Paths</Link>
          <Link to="/challenges" className={isActive("/challenges")}>🎯 Challenges</Link>
          <Link to="/leaderboard" className={isActive("/leaderboard")}>🏆 Leaderboard</Link>
          <Link to="/shop" className={isActive("/shop")}>🛒 Shop</Link>
          <Link to="/profile" className={isActive("/profile")}>👤 Profile</Link>
        </div>
      </div>

      <div className="nav-right">
        <div className="nav-lvl-pill">🥇 Lvl {level}</div>

        <button className="logout-icon-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}