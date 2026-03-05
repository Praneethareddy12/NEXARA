import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHALLENGE_MAP } from '../data/challengeData';
import api from '../api/axios';
import './Challenges.css';

export default function Challenges() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState([]);
  const allIds = Object.keys(CHALLENGE_MAP);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setCompleted(res.data.completedModules || []);
      } catch (err) { console.error("Failed to fetch progress"); }
    };
    fetchProgress();
  }, []);

  const isLocked = (id) => {
    const currentSeq = CHALLENGE_MAP[id].seq;
    if (currentSeq === 1) return false;
    const prevChallenge = allIds.find(key => CHALLENGE_MAP[key].seq === currentSeq - 1);
    return !completed.includes(prevChallenge);
  };

  return (
    <div className="arena-container">
      <h1>Challenge Arena ⚔️</h1>
      <p>Test your skills with real-world data science challenges</p>

      <h2>Challenges</h2>
      <div className="card-grid">
        {allIds.map(id => {
          const locked = isLocked(id);
          return (
            <div key={id} className={CHALLENGE_MAP[id].diff === "BOSS LEVEL" ? "boss-card" : "challenge-card"}>
              <span className="difficulty-badge">{CHALLENGE_MAP[id].diff}</span>
              <h3>{CHALLENGE_MAP[id].title}</h3>
              <div className="meta-info">
                <span>⚡ {CHALLENGE_MAP[id].xp} XP</span>
                <span>🕒 {CHALLENGE_MAP[id].time}</span>
              </div>
              <button 
                className="start-btn" 
                style={{ backgroundColor: locked ? '#ccc' : (CHALLENGE_MAP[id].diff === "BOSS LEVEL" ? '#e91e63' : '#000') }}
                disabled={locked}
                onClick={() => !locked && navigate(`/challenge/${id}`)}
              >
                {locked ? "Locked" : "Start Challenge"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}