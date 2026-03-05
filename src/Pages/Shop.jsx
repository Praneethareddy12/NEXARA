import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Shop.css";

export default function Shop() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get("/api/auth/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const buyFreeze = async () => {
    try {
      const res = await api.post("/api/auth/buy-freeze");
      setMessage(res.data.message);
      fetchUserData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Purchase failed");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <p>Opening the Market...</p>
      </div>
    );
  }

  return (
    <div className="shop-container">
      {/* Standardized Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">✨ Nexara</div>
          <div className="nav-menu">
            <a href="/home">🏠 Home</a>
            <a href="/dashboard">📊 Dashboard</a>
            <a href="/paths">📖 Learning Paths</a>
            <a href="/challenges">🎯 Challenges</a>
            <a href="/leaderboard">🏆 Leaderboard</a>
            <a href="/shop" className="active">🛒 Shop</a>
            <a href="/profile">👤 Profile</a>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-lvl-pill">💰 {user?.coins || 0} Coins</div>
          <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </nav>

      <main className="shop-main">
        <div className="shop-header">
          <h1>Nexara Market 🛒</h1>
          <p>Use your earned coins to protect your progress and get boosts.</p>
        </div>

        {message && <div className="shop-alert">{message}</div>}

        <div className="items-grid">
          <div className={`item-card ${user?.streakFreezeActive ? "owned" : ""}`}>
            <div className="item-icon">❄️</div>
            <div className="item-info">
              <h3>Streak Freeze</h3>
              <p>Protects your streak for 1 day if you miss your daily practice.</p>
              <div className="item-price">
                <span>50 Coins</span>
                {user?.streakFreezeActive ? (
                  <button className="buy-btn disabled" disabled>Active</button>
                ) : (
                  <button className="buy-btn" onClick={buyFreeze}>Buy Now</button>
                )}
              </div>
            </div>
            {user?.streakFreezeActive && <div className="owned-badge">Equipped</div>}
          </div>

          <div className="item-card locked">
            <div className="item-icon">💎</div>
            <div className="item-info">
              <h3>Double XP (2h)</h3>
              <p>Coming Soon: Earn 2x XP on all modules for two hours.</p>
              <div className="item-price">
                <span>150 Coins</span>
                <button className="buy-btn locked" disabled>Locked</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}