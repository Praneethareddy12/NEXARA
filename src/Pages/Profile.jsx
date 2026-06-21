import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../Components/Navbar";
import "./Profile.css";
import { useUser } from "../context/UserContext";

export default function Profile() {
  const { user, fetchUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", avatar: "" });

  const avatars = ["🐱", "🐶", "🦊", "🐼", "🐸", "🐵", "🦄", "🐯"];

  useEffect(() => {
    if (!user) {
      fetchUser();
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      name: user.name || "",
      avatar: user.avatar || "",
    });
  }, [user, fetchUser]);

  const handleUpdate = async () => {
    try {
      await api.put("/api/auth/update-profile", formData);
      setEditing(false);
      fetchUser();
    } catch {
      alert("Update failed");
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  // ✅ ACHIEVEMENTS (OBJECT FORMAT)
  const achievements = [
    { name: "🔥 3 Day Streak", unlocked: user.streak >= 3 },
    { name: "🔥 7 Day Streak", unlocked: user.streak >= 7 },
    { name: "⭐ Level 2", unlocked: user.level >= 2 },
    { name: "⭐ Level 5", unlocked: user.level >= 5 },
    {
      name: "📘 5 Modules Done",
      unlocked: (user.completedModules?.length || 0) >= 5,
    },
    {
      name: "🏆 3 Challenges",
      unlocked: (user.completedChallenges?.length || 0) >= 3,
    },
  ];

  return (
    <div className="profile-container">
      <Navbar />

      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar">
            {user.avatar || user.name?.charAt(0).toUpperCase()}
          </div>

          {editing ? (
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          ) : (
            <h2>{user.name}</h2>
          )}

          {/* AVATAR PICKER */}
          {editing && (
            <div className="avatar-picker">
              {avatars.map((a) => (
                <span
                  key={a}
                  onClick={() => setFormData({ ...formData, avatar: a })}
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    margin: "5px",
                    border:
                      formData.avatar === a ? "2px solid #7c3aed" : "none",
                    borderRadius: "10px",
                    padding: "5px",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          <p>{user.email}</p>

          {editing ? (
            <button onClick={handleUpdate}>Save</button>
          ) : (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-box">
            <h3>{user.level || 0}</h3>
            <p>Level</p>
          </div>

          <div className="stat-box">
            <h3>{user.xp || 0}</h3>
            <p>XP</p>
          </div>

          <div className="stat-box">
            <h3>🔥 {user.streak || 0}</h3>
            <p>Streak</p>
          </div>

          <div className="stat-box">
            <h3>🪙 {user.coins || 0}</h3>
            <p>Coins</p>
          </div>
        </div>

        {/* XP BAR */}
        <div className="xp-section">
          <p>{user.xp} XP</p>

          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${(user.xp % 2000) / 20}%` }}
            ></div>
          </div>

          <p>{2000 - (user.xp % 2000)} XP to next level</p>
        </div>

        {/* ✅ ACHIEVEMENTS */}
        <div className="achievements">
          <h3>Achievements</h3>

          <div className="badge-container">
            {achievements.map((a, i) => (
              <div
                key={i}
                className={`badge ${a.unlocked ? "unlocked" : "locked"}`}
              >
                {/* ICON BIG */}
                <span style={{ fontSize: "18px", marginRight: "6px" }}>
                  {a.name.split(" ")[0]}
                </span>

                {/* TEXT */}
                {a.name.substring(a.name.indexOf(" ") + 1)}
              </div>
            ))}
          </div>

          {/* ✅ EMPTY STATE */}
          {achievements.every((a) => !a.unlocked) && (
            <p style={{ color: "#aaa", marginTop: "10px" }}>
              No achievements yet 🚀
            </p>
          )}
        </div>

        <div className="adaptive-profile-section">
          <h3>Adaptive Insights</h3>
          <p><strong>Daily problem completion:</strong> {user.dailyProblemCompletionRate || 0}%</p>
          <p><strong>Challenge attempts:</strong> {user.challengeStats?.attempts || user.challengeAttempts || 0}</p>
          <p><strong>Challenge failures:</strong> {user.challengeStats?.failures || user.challengeFailures || 0}</p>
          <p><strong>Average challenge score:</strong> {user.challengeStats?.averageScore || user.averageScore || 0}</p>
          <p><strong>Unlocked paths:</strong> {(user.unlockedPaths || []).join(", ") || "None"}</p>
          <div className="strengths-weaknesses">
            <div>
              <h4>Strengths</h4>
              <ul>
                {user.skillProfile?.strengths?.map((item) => (
                  <li key={item.skill}>{item.skill}: {item.score}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Weaknesses</h4>
              <ul>
                {user.skillProfile?.weaknesses?.map((item) => (
                  <li key={item.skill}>{item.skill}: {item.score}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ACTIVITY */}
        <div>
          <h3>Recent Activity</h3>
          <p>Completed {user.completedModules.length} challenges</p>
        </div>

        {/* PROGRESS */}
        <div className="profile-progress">
          <h3>Progress</h3>
          <p>📘 Modules Completed: {user.completedModules.length}</p>
          <p>🏆 Challenges Completed: {user.completedChallenges?.length || 0}</p>
        </div>

      </div>
    </div>
  );
}