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
    completedChallenges: [],
    problemsSolvedDatesFormatted: [],
    recommendedPaths: [],
    recommendedChallenge: null,
    dailyProblemCompletionRate: 0,
    unlockedPaths: [],
    skillProfile: null
  });

  const [dailyProblem, setDailyProblem] = useState(null);
  const [solvedToday, setSolvedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const hotChallengeIds = ["c1", "c2", "c3"];
  const DAILY_PROBLEM_IDS = ["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10"];

  const challengeIds = Object.keys(CHALLENGE_MAP);

  const formatDateStr = (year, month, day) => {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const getProblemIdFromDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const seed = (year + month + day) % DAILY_PROBLEM_IDS.length;
    return DAILY_PROBLEM_IDS[seed];
  };

  const getDailyProblemLink = (dateStr) => {
    const id = getProblemIdFromDate(dateStr);
    return `/challenge/${id}`;
  };

  const today = new Date();
  const getTodayDateString = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      .toISOString()
      .split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const rawProgress = profileRes.data.completedModules || [];
        const uniquePathIds = new Set(
          rawProgress.map((item) => item.split("-")[0])
        );

        setUser({
          username: profileRes.data.name || profileRes.data.email.split("@")[0],
          xp: profileRes.data.xp || 0,
          level: profileRes.data.level || 1,
          coins: profileRes.data.coins || 0,
          pathsCount: uniquePathIds.size,
          streak: profileRes.data.streak || 0,
          bestStreak: profileRes.data.bestStreak || 0,
          completedModules: rawProgress,
          completedChallenges: profileRes.data.completedChallenges || [],
          problemsSolvedDatesFormatted: profileRes.data.problemsSolvedDatesFormatted || [],
          recommendedPaths: profileRes.data.recommendedPaths || [],
          recommendedChallenge: profileRes.data.recommendedChallenge || null,
          dailyProblemCompletionRate: profileRes.data.dailyProblemCompletionRate || 0,
          unlockedPaths: profileRes.data.unlockedPaths || [],
          skillProfile: profileRes.data.skillProfile || null
        });

        const problemRes = await api.get("/api/auth/daily-problem");
        setDailyProblem(problemRes.data.problem);

        const solved = profileRes.data.problemsSolvedDatesFormatted?.includes(getTodayDateString()) || false;
        setSolvedToday(solved);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSolveProblem = async () => {
    try {
      const res = await api.post("/api/auth/solve-daily-problem");

      setUser(prev => ({
        ...prev,
        streak: res.data.user.streak,
        bestStreak: res.data.user.bestStreak,
        xp: res.data.user.xp,
        coins: res.data.user.coins,
        level: res.data.user.level,
        problemsSolvedDatesFormatted: Array.from(
          new Set([...(prev.problemsSolvedDatesFormatted || []), getTodayDateString()])
        )
      }));

      setSolvedToday(true);
      alert("🎉 Daily problem solved! Streak increased!");
    } catch (err) {
      alert(err.response?.data?.message || "Error solving problem");
    }
  };

  const {
    xp,
    level,
    username,
    coins,
    pathsCount,
    streak,
    bestStreak,
    completedChallenges,
    completedModules,
    problemsSolvedDatesFormatted,
    recommendedPaths,
    recommendedChallenge,
    dailyProblemCompletionRate,
    unlockedPaths,
    skillProfile
  } = user;

  // PROGRESS
  const progressPercentage = Math.min(
    100,
    Math.round((completedModules.length / 50) * 100)
  );

  // SKILLS
  const skillMetrics = user.skillProfile?.skills || {
    Python: 0,
    SQL: 0,
    Stats: 0,
    ML: 0,
    DataViz: 0,
    DeepLearning: 0
  };

  // RADAR
  const radarData = {
    labels: Object.keys(skillMetrics),
    datasets: [
      {
        data: Object.values(skillMetrics),
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

  // ✅ STREAK CALENDAR (BASED ON ACTUAL PROBLEM DATES)
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeDates = new Set();
  if (problemsSolvedDatesFormatted) {
    problemsSolvedDatesFormatted.forEach(dateStr => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && date.getMonth() === month) {
        activeDates.add(date.getDate());
      }
    });
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
            {Object.entries(skillMetrics).map(([key, value]) => (
              <div key={key} className="skill-bar">
                <span>{key}</span>
                <div className="bar">
                  <div style={{ width: `${value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {recommendedPaths && recommendedPaths.length > 0 && (
          <div className="adaptive-recommendation-card">
            <h3>Recommended learning path</h3>
            <p>Boost weak skills with a path tailored to your current progress.</p>
            <div className="recommendation-list">
              {recommendedPaths.slice(0, 2).map((path) => (
                <div key={path.id} className="recommendation-item">
                  <strong>{path.title}</strong>
                  <span>{path.progress}% complete</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.recommendedChallenge && (
          <div className="adaptive-recommendation-card">
            <h3>Recommended challenge</h3>
            <p>Sharpen your weakest skills with this challenge.</p>
            <div className="recommendation-list">
              <div className="recommendation-item">
                <strong>{user.recommendedChallenge.id}</strong>
                <span>
                  {Object.keys(user.recommendedChallenge.skillWeights || {}).join(", ")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="adaptive-recommendation-card">
          <h3>Daily completion rate</h3>
          <p>{user.dailyProblemCompletionRate}% in the last 30 days</p>
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
              {calendarDays.map((day, i) => {
                const dateStr = formatDateStr(year, month + 1, day.day);
                return (
                  <div
                    key={i}
                    className="calendar-item"
                    onClick={() => navigate(getDailyProblemLink(dateStr))}
                  >
                    <div className={`day ${day.active ? "active" : ""}`} />
                    <span>{day.day}</span>
                  </div>
                );
              })}
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

        {/* DAILY PROBLEM */}
        {dailyProblem && (
          <div className="card daily-problem-card">
            <h3>⭐ Today's Daily Challenge</h3>
            <p className="daily-subtitle">Solve to maintain your streak!</p>

            <div className="daily-problem-item">
              <div className="problem-info">
                <h4>{dailyProblem.title}</h4>
                <p>{dailyProblem.description}</p>
                <div className="problem-meta">
                  <span className="difficulty">{dailyProblem.difficulty}</span>
                  <span className="reward">+{dailyProblem.xpReward} XP</span>
                  <span className="reward">+{dailyProblem.coinsReward} Coins</span>
                </div>
              </div>
            </div>

            <div className="daily-actions">
              <button
                className="solve-btn"
                onClick={handleSolveProblem}
                disabled={solvedToday}
              >
                {solvedToday ? "Already Solved Today" : "✨ Mark as Solved"}
              </button>

              <button
                className="link-btn"
                onClick={() => navigate(`/challenge/${dailyProblem.id}`)}
              >
                Open Daily Problem
              </button>
            </div>

            {solvedToday && (
              <div className="solved-banner">
                ✅ You've already solved today's challenge! Come back tomorrow for more!
              </div>
            )}
          </div>
        )}

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