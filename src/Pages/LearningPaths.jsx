import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../Components/Navbar";
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
  const [recommendedPaths, setRecommendedPaths] = useState([]);
  const [learningPathInsights, setLearningPathInsights] = useState([]);
  const [unlockedPaths, setUnlockedPaths] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setUserStats({ level: res.data.level || 1 });
        setRecommendedPaths(res.data.recommendedPaths || []);
        setLearningPathInsights(res.data.learningPathInsights || []);
        setUnlockedPaths(res.data.unlockedPaths || []);
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };
    fetchUserData();
  }, []);

  const getCompletedCount = (pathId) => {
    const completedModules = learningPathInsights.find((path) => path.id === pathId)?.completedModules || 0;
    return completedModules;
  };

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
      <Navbar />

      <main className="paths-main-content">
        <header className="paths-header-section">
          <h1 className="paths-title">Learning Paths 🎓</h1>
          <p className="paths-subtitle">Master data science from beginner to expert</p>
        </header>

        {recommendedPaths.length > 0 && (
          <section className="paths-recommendation-bar">
            <h2>Recommended for your adaptive learning journey</h2>
            <div className="recommendation-list">
              {recommendedPaths.map((path) => (
                <div key={path.id} className="recommendation-pill">
                  <strong>{path.title}</strong>
                  <span>{path.status === "Completed" ? "Completed" : `${path.progress}% complete`}</span>
                </div>
              ))}
            </div>
          </section>
        )}

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
          {filteredPaths.map((path) => {
            const insight = learningPathInsights.find((item) => item.id === path.id) || {};
            const completedCount = insight.completedModules || 0;
            const progressPercent = insight.progress || 0;
            const isRecommended = recommendedPaths.some((recommended) => recommended.id === path.id);
            const isUnlocked = insight.unlocked !== undefined ? insight.unlocked : unlockedPaths.includes(path.id);

            return (
              <div key={path.id} className={`path-card-item ${isRecommended ? "recommended" : ""} ${!isUnlocked ? "locked" : ""}`}>
                <div className="path-card-top">
                  <div className="path-icon-bg" style={{ backgroundColor: path.color + '22' }}>
                    <span className="path-emoji">{path.icon}</span>
                  </div>
                  <div>
                    <h4 className="path-name">{path.title}</h4>
                    <p className="path-mini-desc">Master the basics of {path.title.split(" ")[0]}...</p>
                  </div>
                </div>
                <div className="path-progress-row">
                  <span>{progressPercent}% complete</span>
                  <span>{completedCount}/{path.modules} modules</span>
                </div>
                <div className="path-progress-bar">
                  <div style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="path-card-bottom">
                  <span className="module-count">📖 {path.modules} modules</span>
                  <button
                    className="start-learning-btn"
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && navigate(`/learn/${path.id}`)}
                  >
                    {isUnlocked ? "Start Learning" : "Locked"}
                  </button>
                </div>
                {!isUnlocked && <div className="locked-pill">Unlock prerequisites</div>}
                {isRecommended && isUnlocked && <div className="recommended-pill">Recommended</div>}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}