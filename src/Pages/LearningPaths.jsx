import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./LearningPaths.css";

const pathsData = [
  { id: "1", title: "Python Fundamentals", category: "Fundamentals", level: "Beginner", time: "20h", xp: "2000 XP", modules: 4, icon: "🐍", color: "#6366f1" },
  { id: "2", title: "Python for Data Science", category: "Programming", level: "Beginner", time: "20h", xp: "1500 XP", modules: 4, icon: "📊", color: "#8b5cf6" },
  { id: "3", title: "NumPy & Pandas Mastery", category: "Data Engineering", level: "Intermediate", time: "30h", xp: "3000 XP", modules: 4, icon: "🐼", color: "#3b82f6" },
  { id: "4", title: "Statistics & Probability", category: "Statistics", level: "Intermediate", time: "25h", xp: "2500 XP", modules: 4, icon: "📈", color: "#10b981" },
  { id: "5", title: "Machine Learning Foundations", category: "Machine Learning", level: "Advanced", time: "50h", xp: "5000 XP", modules: 4, icon: "🤖", color: "#f59e0b" },
  { id: "6", title: "Deep Learning & Neural Networks", category: "Deep Learning", level: "Expert", time: "60h", xp: "6000 XP", modules: 4, icon: "🧠", color: "#ec4899" },
];

export default function LearningPaths() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All Categories");
  const [level, setLevel] = useState("All Levels");
  const [search, setSearch] = useState("");
  const [userStats, setUserStats] = useState({ level: 1 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setUserStats({ level: res.data.level || 1 });
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };
    fetchUserData();
  }, []);

  const filteredPaths = pathsData.filter(path => {
    const matchCat = category === "All Categories" || path.category === category;
    const matchLvl = level === "All Levels" || path.level === level;
    const matchSearch = path.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLvl && matchSearch;
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="paths-page-wrapper">
      {/* Standardized Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">✨ Nexara</div>
          <div className="nav-menu">
            <a href="/home">🏠 Home</a>
            <a href="/dashboard">📊 Dashboard</a>
            <a href="/paths" className="active">📖 Learning Paths</a>
            <a href="/challenges">🎯 Challenges</a>
            <a href="/leaderboard">🏆 Leaderboard</a>
            <a href="/shop">🛒 Shop</a>
            <a href="/profile">👤 Profile</a>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-lvl-pill">🥇 Lvl {userStats.level}</div>
          <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </nav>

      <main className="paths-main-content">
        <header className="paths-header-section">
          <h1 className="paths-title">Learning Paths 🎓</h1>
          <p className="paths-subtitle">Master data science from beginner to expert</p>
        </header>

        <div className="paths-filter-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search learning paths..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All Categories</option>
            <option>Fundamentals</option>
            <option>Programming</option>
            <option>Data Engineering</option>
            <option>Statistics</option>
            <option>Machine Learning</option>
            <option>Deep Learning</option>
          </select>
          <select className="filter-dropdown" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Expert</option>
          </select>
        </div>

        <div className="paths-grid-layout">
          {filteredPaths.map((path) => (
            <div key={path.id} className="path-card-item">
              <div className="path-card-top">
                <div className="path-icon-bg" style={{ backgroundColor: path.color + '22' }}>
                  <span className="path-emoji">{path.icon}</span>
                </div>
                <div>
                  <h4 className="path-name">{path.title}</h4>
                  <p className="path-mini-desc">Master the basics of {path.title.split(" ")[0]}...</p>
                </div>
              </div>
              <div className="path-card-bottom">
                <span className="module-count">📖 {path.modules} modules</span>
                <button className="start-learning-btn" onClick={() => navigate(`/learn/${path.id}`)}>Start Learning</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}