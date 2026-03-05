import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Home from "./Pages/Home";
import LearningPaths from "./Pages/LearningPaths";
import CourseDetail from "./Pages/CourseDetail";
import Shop from "./Pages/Shop";
import Leaderboard from "./Pages/Leaderboard";
import Challenges from "./Pages/Challenges";
import ChallengeDetail from "./Pages/ChallengeDetail"; // FIXED: Import added

// PrivateRoute Wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (

      <Routes>
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/login" 
          element={<Login setIsLoggedIn={setIsLoggedIn} />} 
        />
        
        {/* Protected Routes */}
        <Route path="/home" element={<Home />} />

        <Route 
          path="/challenge/:id" 
          element={<PrivateRoute><ChallengeDetail /></PrivateRoute>} 
        />

        <Route 
          path="/dashboard" 
          element={<PrivateRoute><Dashboard /></PrivateRoute>} 
        />
        <Route 
          path="/paths" 
          element={<PrivateRoute><LearningPaths /></PrivateRoute>} 
        />
        <Route 
          path="/learn/:id" 
          element={<PrivateRoute><CourseDetail /></PrivateRoute>} 
        />
        <Route 
          path="/shop" 
          element={<PrivateRoute><Shop /></PrivateRoute>} 
        />
        <Route 
          path="/leaderboard" 
          element={<PrivateRoute><Leaderboard /></PrivateRoute>} 
        />
        <Route 
          path="/challenges" 
          element={<PrivateRoute><Challenges /></PrivateRoute>} 
        />
        <Route 
          path="/profile" 
          element={<PrivateRoute><Dashboard /></PrivateRoute>} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}

export default App;