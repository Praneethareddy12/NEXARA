import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar"; // ✅ fix casing if needed
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-announcement">
          <span className="rocket-icon">🚀</span> Next Generation Learning Platform
        </div>

        <h1 className="hero-main-title">
          Master Data Science <br />
          <span className="highlight-text">Through Gaming</span>
        </h1>

        <p className="hero-description">
          Level up your skills with interactive challenges, earn XP, unlock <br />
          achievements, and compete with data scientists worldwide 🌍
        </p>

        <button
          className="dashboard-cta"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard <span className="arrow-icon">→</span>
        </button>

        <div className="hero-stats-row">
          <div className="hero-stat-item">
            <h3>3+</h3>
            <p>Learners</p>
          </div>
          <div className="hero-stat-item">
            <h3>16+</h3>
            <p>Challenges</p>
          </div>
          <div className="hero-stat-item">
            <h3>2K+</h3>
            <p>XP Earned</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="info-section">
        <h2 className="section-header">Why Learn With Us? 🎯</h2>
        <p className="section-subtext">
          The most engaging way to master data science
        </p>

        <div className="features-card-grid">
          <div className="feature-item-card">
            <div className="icon-wrapper purple">🤖</div>
            <h4>AI-Powered Learning</h4>
            <p>Personalized curriculum adapted to your skill level and learning pace.</p>
          </div>

          <div className="feature-item-card">
            <div className="icon-wrapper blue">{"<>"}</div>
            <h4>Real Code Execution</h4>
            <p>Write and run Python code directly in your browser with instant feedback.</p>
          </div>

          <div className="feature-item-card">
            <div className="icon-wrapper orange">🏆</div>
            <h4>Gamified Experience</h4>
            <p>Earn XP, unlock achievements, and compete on global leaderboards.</p>
          </div>

          <div className="feature-item-card">
            <div className="icon-wrapper green">📊</div>
            <h4>Industry Projects</h4>
            <p>Solve real-world data science challenges from top companies.</p>
          </div>
        </div>
      </section>

      {/* Paths Section */}
      <section className="info-section">
        <h2 className="section-header">Choose Your Path 🗺️</h2>
        <p className="section-subtext">
          From beginner to expert, we've got you covered
        </p>

        <div className="paths-card-grid">
          <div className="path-item-card">
            <div className="path-icon green">🐍</div>
            <h4>Python Fundamentals</h4>
            <div className="path-meta">
              <span>Beginner</span> <span>20h</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
          </div>

          <div className="path-item-card">
            <div className="path-icon blue">🐼</div>
            <h4>Data Analysis with Pandas</h4>
            <div className="path-meta">
              <span>Intermediate</span> <span>35h</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
          </div>

          <div className="path-item-card">
            <div className="path-icon orange">🤖</div>
            <h4>Machine Learning Mastery</h4>
            <div className="path-meta">
              <span>Advanced</span> <span>50h</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
          </div>

          <div className="path-item-card">
            <div className="path-icon pink">🧠</div>
            <h4>Deep Learning & Neural Networks</h4>
            <div className="path-meta">
              <span>Expert</span> <span>60h</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
          </div>
        </div>

        <button
          className="view-paths-btn"
          onClick={() => navigate("/paths")}
        >
          View All Learning Paths →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer-bar">
        <div className="footer-inner">
          <span className="footer-logo">✨ Nexara</span>
          <span className="footer-copy">© 2026</span>
          <span className="footer-divider">|</span>
          <span className="footer-tag">
            Master data science through gamified learning 🚀
          </span>
        </div>
      </footer>

    </div>
  );
}