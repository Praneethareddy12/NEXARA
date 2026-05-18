import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CHALLENGE_MAP } from "../data/challengeData";
import Navbar from "../Components/Navbar";
import "./Dashboard.css";

import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "User",
    xp: 0,
    level: 1,
    coins: 0,
    pathsCount: 0,
    streak: 0,
    bestStreak: 0,
    completedModules: [],
    completedChallenges: []
  });

  const hotChallengeIds = ["c1", "c2", "c3"];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/auth/profile");

        const rawProgress = res.data.completedModules || [];
        const uniquePathIds = new Set(
          rawProgress.map((item) => item.split("-")[0])
        );

        setUser({
          username: res.data.name || res.data.email.split("@")[0],
          xp: res.data.xp || 0,
          level: res.data.level || 1,
          coins: res.data.coins || 0,
          pathsCount: uniquePathIds.size,
          streak: res.data.streak || 0,
          bestStreak: res.data.bestStreak || 0,
          completedModules: rawProgress,
          completedChallenges: res.data.completedChallenges || []
        });
      } catch {
        console.log("error fetching user");
      }
    };

    fetchUserData();
  }, []);

  const {
    xp,
    level,
    username,
    coins,
    pathsCount,
    streak,
    bestStreak,
    completedChallenges,
    completedModules
  } = user;

  // PROGRESS
  const progressPercentage = Math.min(
    100,
    Math.round((completedModules.length / 50) * 100)
  );

  // SKILLS
  const skills = {
    Python: Math.min(100, completedModules.length * 5),
    SQL: Math.min(100, completedChallenges.length * 10),
    Stats: Math.min(100, xp / 50),
    ML: Math.min(100, level * 15),
    DataViz: Math.min(
      100,
      (completedModules.length + completedChallenges.length) * 3
    )
  };

  // RADAR
  const radarData = {
    labels: Object.keys(skills),
    datasets: [
      {
        data: Object.values(skills),
        backgroundColor: "rgba(124,58,237,0.4)",
        borderColor: "#7c3aed",
        borderWidth: 2
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, color: "#aaa" },
        angleLines: { color: "#444" },
        grid: { color: "#444" },
        pointLabels: { color: "white" }
      }
    },
    plugins: { legend: { display: false } }
  };

  // ✅ FIXED STREAK CALENDAR
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeDates = new Set();
  for (let i = 0; i < streak; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    if (d.getMonth() === month) {
      activeDates.add(d.getDate());
    }
  }

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    return {
      day: dayNumber,
      active: activeDates.has(dayNumber)
    };
  });

  return (
    <div className="dashboard-container">
      <Navbar level={level} />

      <main className="dashboard-main">
        <h1 className="welcome-text">
          Welcome back, {username}! 👋
        </h1>

        {/* PROGRESS */}
        <div className="progress-card">
          <div className="progress-header">
            <span>Course Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* TOP */}
        <div className="dashboard-top-grid">
          <div className="stat-card">
            <h3>Level</h3>
            <h1>{level}</h1>
            <p>{xp} XP</p>
          </div>

          <div className="stat-card streak-card">
            <h3>🔥 Streak</h3>
            <h1>{streak} days</h1>
            <p>Best: {bestStreak}</p>
          </div>

          <div className="stat-card">
            <h3>Skill Assessment</h3>
            {Object.entries(skills).map(([key, value]) => (
              <div key={key} className="skill-bar">
                <span>{key}</span>
                <div className="bar">
                  <div style={{ width: `${value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="dashboard-second-row">
          <div className="stat-card">
            <h3>Skill Radar</h3>
            <Radar data={radarData} options={radarOptions} />
          </div>

          <div className="stat-card calendar-card">
            <h3>
              📅 {today.toLocaleString("default", { month: "long" })} {year}
            </h3>

            <div className="calendar">
              {calendarDays.map((day, i) => (
                <div key={i} className="calendar-item">
                  <div className={`day ${day.active ? "active" : ""}`} />
                  <span>{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MID */}
        <div className="dashboard-mid-grid">
          <div className="mini-card">🏆 {completedChallenges.length}</div>
          <div className="mini-card">⚡ {xp}</div>
          <div className="mini-card">🪙 {coins}</div>
          <div className="mini-card">📚 {pathsCount}</div>
        </div>

        {/* CHALLENGES */}
        <div className="card">
          <h3>🔥 Hot Challenges</h3>

          {hotChallengeIds.map((id) => (
            <div
              key={id}
              className="challenge-row"
              onClick={() => navigate(`/challenge/${id}`)}
            >
              <div>
                <p>{CHALLENGE_MAP[id].title}</p>
                <span>{CHALLENGE_MAP[id].diff}</span>
              </div>
              <b>{CHALLENGE_MAP[id].xp} XP</b>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}