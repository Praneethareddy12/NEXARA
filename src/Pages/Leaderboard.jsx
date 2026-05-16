import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../Components/Navbar";
import "./Leaderboard.css";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [user, setUser] = useState({ level: 1, xp: 0, email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderRes, profileRes] = await Promise.all([
          api.get("/api/auth/leaderboard"),
          api.get("/api/auth/profile")
        ]);
        setLeaders(leaderRes.data);
        setUser(profileRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const myRank = leaders.findIndex((l) => l.email === user.email) + 1;

  return (
    <div className="leaderboard-container">
      <Navbar />

      <main className="leaderboard-main">
        <div className="leaderboard-header">
          <h1>Global Rankings 🏆</h1>
          <p>See how you stack up against the best data scientists in the world.</p>
        </div>

        {/* Your Rank Banner */}
        <div className="rank-banner">
          <div className="rank-badge">#{myRank || "-"}</div>
          <div className="rank-info">
            <h3>Your Rank</h3>
            <p>⚡ {user.xp?.toLocaleString()} XP • 🥇 Lvl {user.level}</p>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="leaderboard-card">
          {loading ? (
            <div className="loading-state">Loading rankings...</div>
          ) : (
            <div className="leaderboard-list">
              {leaders.map((leader, index) => (
                <div 
                  key={leader._id} 
                  className={`leader-row ${leader.email === user.email ? 'highlight-user' : ''}`}
                >
                  <div className="leader-pos">{index + 1}</div>
                  <div className="leader-info">
                    <h4>{leader.email.split("@")[0]} {leader.email === user.email && <span>(You)</span>}</h4>
                    <p>Lvl {leader.level} • {leader.streak} day streak</p>
                  </div>
                  <div className="leader-xp">{leader.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}