import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../Components/Navbar";
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
import "./LearningPaths.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function AdaptivePath() {
  const navigate = useNavigate();
  const [adaptiveData, setAdaptiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdaptive = async () => {
      try {
        const res = await api.get("/api/auth/adaptive");
        setAdaptiveData(res.data);
      } catch (err) {
        console.error("Failed to load adaptive data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAdaptive();
  }, []);

  if (loading) return <div className="loading">Loading adaptive learning...</div>;
  if (!adaptiveData) return <div className="loading">No adaptive data available.</div>;

  const profile = adaptiveData.skillProfile || { skills: {} };
  const labels = Object.keys(profile.skills || {});
  const scores = Object.values(profile.skills || {});

  const radarData = {
    labels,
    datasets: [
      {
        data: scores,
        backgroundColor: "rgba(34,197,94,0.3)",
        borderColor: "#22c55e",
        borderWidth: 2
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, color: "#999" },
        angleLines: { color: "#ccc" },
        grid: { color: "#ccc" },
        pointLabels: { color: "#333" }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="paths-page-wrapper">
      <Navbar />
      <main className="paths-main-content">
        <header className="paths-header-section">
          <h1 className="paths-title">Adaptive Learning Path</h1>
          <p className="paths-subtitle">Personalized recommendations based on your skills and progress.</p>
        </header>

        <section className="adaptive-summary-grid">
          <div className="adaptive-summary-card">
            <h3>Skill profile</h3>
            <Radar data={radarData} options={radarOptions} />
          </div>

          <div className="adaptive-summary-card">
            <h3>Daily performance</h3>
            <p>{adaptiveData.dailyProblemCompletionRate}% completion rate last 30 days</p>
            <p>{adaptiveData.challengeStats?.attempts || 0} challenge attempts</p>
            <p>{adaptiveData.challengeStats?.failures || 0} failures</p>
            <p>Average score: {adaptiveData.challengeStats?.averageScore || 0}</p>
            <p>Success rate: {adaptiveData.challengeStats?.successRate || 0}%</p>
          </div>
        </section>

        <section className="paths-recommendation-bar">
          <h2>Recommended paths</h2>
          <div className="recommendation-list">
            {adaptiveData.recommendedPaths.map((path) => (
              <div key={path.id} className="recommendation-pill">
                <strong>{path.title}</strong>
                <span>{path.progress}% complete</span>
              </div>
            ))}
          </div>
        </section>

        <section className="paths-recommendation-bar">
          <h2>Unlocked paths</h2>
          <div className="recommendation-list">
            {adaptiveData.unlockedPaths?.length > 0 ? (
              adaptiveData.unlockedPaths.map((id) => (
                <div key={id} className="recommendation-pill">
                  <span>Path {id}</span>
                </div>
              ))
            ) : (
              <div className="recommendation-pill">No paths unlocked yet.</div>
            )}
          </div>
        </section>

        {adaptiveData.recommendedChallenge && (
          <section className="adaptive-recommendation-card">
            <h3>Recommended challenge</h3>
            <p>Focus on: {Object.keys(adaptiveData.recommendedChallenge.skillWeights).join(", ")}</p>
            <button onClick={() => navigate(`/challenge/${adaptiveData.recommendedChallenge.id}`)}>
              Start challenge
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
