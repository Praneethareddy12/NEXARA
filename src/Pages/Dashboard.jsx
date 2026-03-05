import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CHALLENGE_MAP } from "../data/challengeData";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    username: "User",
    xp: 0,
    level: 1,
    coins: 100,
    pathsCount: 0,
    streak: 0,
    bestStreak: 0,
    streakFreezeActive: false,
    completedModules: [],
    completedChallenges: []
  });

  const hotChallengeIds = ['c1', 'c2', 'c3'];
  
  // Calculate progress stats
  const totalChallenges = Object.keys(CHALLENGE_MAP).length;
  const completedCount = user.completedChallenges.length;
  const progressPercentage = Math.round((user.completedModules.length / 50) * 100);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        const rawProgress = res.data.completedModules || [];
        const uniquePathIds = new Set(rawProgress.map((item) => item.split("-")[0]));

        setUser({
          username: res.data.email.split('@')[0],
          xp: res.data.xp || 0,
          level: res.data.level || 1,
          coins: res.data.coins || 0,
          pathsCount: uniquePathIds.size,
          streak: res.data.streak || 0,
          bestStreak: res.data.bestStreak || 0,
          streakFreezeActive: res.data.streakFreezeActive || false,
          completedModules: rawProgress,
          completedChallenges: res.data.completedChallenges || []
        });
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    fetchUserData();
  }, []);

  const { xp, level, username, coins, pathsCount, streak, bestStreak, streakFreezeActive } = user;

  const skills = {
    python: Math.min(90, 20 + (xp / 100)),
    sql: Math.min(85, 10 + (xp / 150)),
    stats: Math.min(80, 5 + (xp / 200)),
    ml: Math.min(75, 2 + (xp / 300)),
    dataViz: Math.min(88, 15 + (xp / 120))
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">✨ Nexara</div>
          <div className="nav-menu">
            <a href="/home">🏠 Home</a>
            <a href="/dashboard" className="active">📊 Dashboard</a>
            <a href="/paths">📖 Learning Paths</a>
            <a href="/challenges">🎯 Challenges</a>
            <a href="/leaderboard">🏆 Leaderboard</a>
            <a href="/shop">🛒 Shop</a>
            <a href="/profile">👤 Profile</a>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-lvl-pill">🥇 Lvl {level}</div>
          <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <h1 className="welcome-text">Welcome back, {username}! 👋</h1>
        
        <div className="progress-card" style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Course Progress</span>
              <span>{progressPercentage}%</span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercentage}%`, background: '#7c3aed' }}></div>
          </div>
          {completedCount >= totalChallenges && <p style={{ color: '#7c3aed', fontWeight: 'bold', marginTop: '10px' }}>🎉 Course Completed!</p>}
        </div>

        <div className="dashboard-top-grid">
          <div className="stat-card level-circle-card">
            <div className="circle-progress" style={{ background: `conic-gradient(#7c3aed ${(xp % 2000) / 20}%, #e5e7eb 0%)` }}>
              <div className="circle-inner">
                <span className="lvl-label">LEVEL</span>
                <span className="lvl-num">{level}</span>
                <span className="xp-sub">{xp} / {level * 2000} XP</span>
              </div>
            </div>
          </div>

          <div className="stat-card streak-card">
            <div className="streak-content">
              <div className="streak-header">🔥 Streak {streakFreezeActive && <span title="Streak Freeze Active">❄️</span>}</div>
              <div className="streak-val">{streak} <span>days</span></div>
              <p className="streak-best">Best: {bestStreak} days</p>
            </div>
          </div>

          <div className="stat-card assessment-card">
            <h3>Skill Assessment</h3>
            <div className="spider-chart-container">
              <div className="radar-background"></div>
              <div className="radar-value-area" style={{ clipPath: `polygon(50% ${100 - skills.python}%, ${50 + (skills.stats * 0.5)}% ${50 - (skills.stats * 0.2)}%, ${50 + (skills.ml * 0.3)}% ${50 + (skills.ml * 0.4)}%, ${50 + (skills.sql * -0.3)}% ${50 + (skills.sql * 0.4)}%, ${50 + (skills.dataViz * -0.5)}% ${50 - (skills.dataViz * 0.2)}%)` }}></div>
            </div>
          </div>
        </div>

        <div className="dashboard-mid-grid">
          <div className="mini-card"><span className="mini-label">Challenges</span><span className="mini-val" style={{ color: "#6366f1" }}>{completedCount}</span></div>
          <div className="mini-card"><span className="mini-label">Total XP</span><span className="mini-val" style={{ color: "#ec4899" }}>{xp}</span></div>
          <div className="mini-card"><span className="mini-label">Coins</span><span className="mini-val" style={{ color: "#f59e0b" }}>{coins}</span></div>
          <div className="mini-card"><span className="mini-label">Paths</span><span className="mini-val" style={{ color: "#10b981" }}>{pathsCount}</span></div>
        </div>

        <div className="dashboard-bottom-grid">
          <div className="challenges-list-card">
            <div className="card-header-flex">
              <h3>🔥 Hot Challenges</h3>
              <button className="view-all-text" onClick={() => navigate("/challenges")}>View All</button>
            </div>
            
            {hotChallengeIds.map((id) => (
              <div 
                key={id} 
                className="challenge-row-item" 
                onClick={() => navigate(`/challenge/${id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="challenge-main-info">
                  <p className="c-name">{CHALLENGE_MAP[id].title}</p>
                  <span className="c-tag">{CHALLENGE_MAP[id].diff.toLowerCase()}</span>
                </div>
                <div className="c-meta-container">
                  <span className="c-xp">{CHALLENGE_MAP[id].xp} XP</span>
                  <span className="c-difficulty">{CHALLENGE_MAP[id].diff.toLowerCase()}</span>
                </div>
              </div>
            ))}

            {/* --- NEW SECTION: Show Completed Challenges --- */}
            <div className="completed-challenges-container" style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
              <h3>✅ Completed</h3>
              {user.completedChallenges.length > 0 ? (
                user.completedChallenges.map((cId) => (
                  <div key={cId} style={{ fontSize: '0.9rem', color: '#4b5563', padding: '4px 0' }}>
                    • {CHALLENGE_MAP[cId] ? CHALLENGE_MAP[cId].title : "Hidden Challenge"}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No challenges completed yet.</p>
              )}
            </div>
          </div>

          <div className="quick-actions-card">
            <h3>Quick Actions</h3>
            <button className="qa-btn blue" onClick={() => navigate("/paths")}>📖 Browse Learning Paths</button>
            <button className="qa-btn pink" onClick={() => navigate("/shop")}>🛒 Visit Shop</button>
            <button className="qa-btn red" onClick={() => navigate("/leaderboard")}>📈 View Leaderboard</button>
          </div>
        </div>
      </main>

      <footer className="centered-footer">
        <div className="footer-logo-main">✨ Nexara © 2026</div>
        <p className="footer-tagline">Master data science through gamified learning 🚀</p>
      </footer>
    </div>
  );
}