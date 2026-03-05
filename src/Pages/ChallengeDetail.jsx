import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CHALLENGE_MAP } from '../data/challengeData';
import api from '../api/axios'; // Import your configured axios instance
import './Challenges.css';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = CHALLENGE_MAP[id];
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/progress/complete', { 
        challengeId: id, 
        xpEarned: challenge.xp 
      });
      alert("Challenge Completed! XP Awarded.");
      navigate('/challenges');
    } catch (err) {
      alert(err.response?.data?.message || "Error saving progress");
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) return <div className="arena-container"><h2>Challenge not found!</h2></div>;

  return (
    <div className="arena-container">
      <button onClick={() => navigate('/challenges')} className="start-btn" style={{width: 'auto', marginBottom: '20px'}}>← Back</button>
      
      <div className="challenge-card">
        <span className="difficulty-badge" style={{ backgroundColor: challenge.diff === 'BOSS LEVEL' ? '#e91e63' : '#f0f0f0' }}>
          {challenge.diff}
        </span>
        <h1>{challenge.title}</h1>
        <p>{challenge.desc}</p>
        
        <div className="meta-info">
          <span>⚡ {challenge.xp} XP</span>
          <span>🏆 {challenge.coins} Coins</span>
          <span>🕒 {challenge.time}</span>
        </div>

        <textarea className="search-input" rows="10" placeholder="Write your solution here..."></textarea>
        <button 
          className="start-btn" 
          onClick={handleSubmit} 
          disabled={submitting}
          style={{ backgroundColor: submitting ? '#ccc' : '#000' }}
        >
          {submitting ? "Saving..." : "Submit Solution"}
        </button>
      </div>
    </div>
  );
}