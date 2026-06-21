import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "passport";
import User from "../models/User.js";
import DailyProblem from "../models/DailyProblem.js";
import { sendResetEmail } from "../utils/sendEmail.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getTodayDate, generateDailyProblems, calculateStreak } from "../utils/dailyProblems.js";
import {
  getDefaultSkills,
  syncSkillProfile,
  getLearningPathSummaries,
  recommendLearningPaths,
  recommendChallenge,
  updateSkillsFromModule,
  updateSkillsFromChallenge,
  ensureUnlockedPaths,
  getDailyProblemCompletionRate,
  getChallengeStats,
  getAdaptivePayload
} from "../utils/adaptiveLearning.js";

const router = express.Router();

/* ==========================================
   1. REGISTER (Sign Up)
   ========================================== */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      email,
      password: hashedPassword,
      xp: 0,
      level: 1,
      coins: 100,
      completedModules: [],
      completedChallenges: [],
      completedPaths: [],
      unlockedPaths: ["1", "2"],
      challengeAttempts: 0,
      challengeFailures: 0,
      challengeScores: [],
      averageScore: 0,
      skills: getDefaultSkills(),
      streak: 0,
      bestStreak: 0,
      problemsSolvedDates: [],
      streakFreezeActive: false
    });

    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ==========================================
   2. LOGIN (Sign In) - SIMPLE AUTH
   ========================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Please log in using Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Just authenticate - streak is now based on solving daily problems, not login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        coins: user.coins,
        streakFreezeActive: user.streakFreezeActive,
        skills: user.skills || getDefaultSkills()
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ==========================================
   3. LEADERBOARD
   ========================================== */

router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find()
      .select("email xp level streak")
      .sort({ xp: -1 })
      .limit(10);
    res.json(topUsers);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

/* ==========================================
   3.5 DAILY PROBLEM SYSTEM 🔥
   ========================================== */

// GET TODAY'S DAILY PROBLEM (same for all users)
router.get("/daily-problem", async (req, res) => {
  try {
    const todayDate = getTodayDate();
    
    let dailyProblem = await DailyProblem.findOne({ date: todayDate });
    if (!dailyProblem) {
      const problem = generateDailyProblems(todayDate);
      dailyProblem = await DailyProblem.create({
        date: todayDate,
        problem
      });
    }

    res.json(dailyProblem);
  } catch (error) {
    console.error("Daily Problem Error:", error);
    res.status(500).json({ message: "Error fetching daily problems" });
  }
});

// SOLVE DAILY PROBLEM (and update streak)
router.post("/solve-daily-problem", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const todayDate = getTodayDate();
    const todayUTC = new Date(todayDate + "T00:00:00Z");

    // Ensure today's problem exists
    let dailyProblem = await DailyProblem.findOne({ date: todayDate });
    if (!dailyProblem) {
      const problem = generateDailyProblems(todayDate);
      dailyProblem = await DailyProblem.create({ date: todayDate, problem });
    }

    const alreadySolvedToday = user.problemsSolvedDates?.some(date => {
      const d = new Date(date);
      return d.toISOString().split('T')[0] === todayDate;
    });

    if (alreadySolvedToday) {
      return res.status(400).json({ message: "You already solved today's problem!" });
    }

    const lastSolved = user.lastProblemSolvedDate ? new Date(user.lastProblemSolvedDate) : null;
    let newStreak = 1;

    if (lastSolved) {
      const lastUTC = new Date(Date.UTC(lastSolved.getUTCFullYear(), lastSolved.getUTCMonth(), lastSolved.getUTCDate()));
      const diffDays = Math.floor((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = (user.streak || 0) + 1;
      } else if (diffDays === 2 && user.streakFreezeActive) {
        user.streakFreezeActive = false;
        newStreak = user.streak || 1;
      } else {
        newStreak = 1;
      }
    }

    user.problemsSolvedDates.push(todayUTC);
    user.lastProblemSolvedDate = todayUTC;
    user.streak = newStreak;

    if (user.streak > (user.bestStreak || 0)) {
      user.bestStreak = user.streak;
    }

    // Award XP and coins
    user.xp = (user.xp || 0) + dailyProblem.problem.xpReward;
    user.coins = (user.coins || 0) + dailyProblem.problem.coinsReward;
    user.level = Math.floor(user.xp / 2000) + 1;

    await user.save();

    res.json({
      message: "Daily problem solved! 🎉",
      user: {
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        bestStreak: user.bestStreak
      }
    });
  } catch (error) {
    console.error("Solve Problem Error:", error);
    res.status(500).json({ message: "Error solving daily problem" });
  }
});

// GET USER'S STREAK CALENDAR (for streak history)
router.get("/streak-calendar", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const calendar = user.problemsSolvedDates?.map(date => {
      return new Date(date).toISOString().split('T')[0];
    }) || [];

    res.json({
      streak: user.streak,
      bestStreak: user.bestStreak,
      problemsSolvedDates: calendar,
      lastProblemSolvedDate: user.lastProblemSolvedDate
    });
  } catch (error) {
    console.error("Streak Calendar Error:", error);
    res.status(500).json({ message: "Error fetching streak calendar" });
  }
});

/* ==========================================
   4. PROGRESS & PROFILE
   ========================================== */

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const calendar = user.problemsSolvedDates?.map(date => {
      return new Date(date).toISOString().split('T')[0];
    }) || [];

    const skillProfile = syncSkillProfile(user);
    ensureUnlockedPaths(user);
    const recommendedPaths = recommendLearningPaths(user);
    const recommendedChallenge = recommendChallenge(user);
    const learningPathInsights = getLearningPathSummaries(user);
    const dailyProblemCompletionRate = getDailyProblemCompletionRate(user);
    const challengeStats = getChallengeStats(user);

    await user.save();

    res.json({
      ...user.toObject(),
      problemsSolvedDatesFormatted: calendar,
      skillProfile,
      recommendedPaths,
      recommendedChallenge,
      learningPathInsights,
      unlockedPaths: user.unlockedPaths,
      dailyProblemCompletionRate,
      challengeStats
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/adaptive", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const adaptivePayload = getAdaptivePayload(user);
    await user.save();

    res.json(adaptivePayload);
  } catch (error) {
    console.error("Adaptive Route Error:", error);
    res.status(500).json({ message: "Error fetching adaptive recommendations" });
  }
});

router.post("/update-progress", protect, async (req, res) => {
  try {
    const { xpToAdd, moduleId, moduleIndex } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (xpToAdd) {
      // ⚡ CHECK IF DOUBLE XP IS ACTIVE
      let actualXp = xpToAdd;
      if (user.doubleXpExpires && new Date() < user.doubleXpExpires) {
        actualXp = xpToAdd * 2;
      } else if (user.doubleXpExpires && new Date() >= user.doubleXpExpires) {
        // 🕐 DOUBLE XP EXPIRED - CLEAR IT
        user.doubleXpExpires = null;
      }
      user.xp = (user.xp || 0) + actualXp;
    }

    const oldLevel = user.level || 1;
    const newLevel = Math.floor(user.xp / 2000) + 1;
   
    if (newLevel > oldLevel) {
      user.level = newLevel;
    }

    const progressKey = `${moduleId}-${moduleIndex}`;
    const isNewModule = !user.completedModules.includes(progressKey);
    if (isNewModule) {
      user.completedModules.push(progressKey);
      updateSkillsFromModule(user, moduleId);
    }

    const pathSummary = getLearningPathSummaries(user).find((path) => path.id === moduleId);
    if (pathSummary && pathSummary.status === "Completed" && !user.completedPaths.includes(moduleId)) {
      user.completedPaths.push(moduleId);
    }

    ensureUnlockedPaths(user);
    await user.save();
    res.json({
      message: "Progress saved",
      user
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error saving progress" });
  }
});

router.put("/update-profile", protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

router.post("/complete-challenge", protect, async (req, res) => {
  try {
    const { challengeId, xpAward, prerequisites, score } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (prerequisites && prerequisites.length > 0) {
      const met = prerequisites.every((id) => user.completedModules.includes(id));
      if (!met) return res.status(403).json({ message: "Prerequisites not met!" });
    }

    const isNewChallenge = !user.completedChallenges.includes(challengeId);
    if (!isNewChallenge) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    user.challengeAttempts = (user.challengeAttempts || 0) + 1;
    if (score !== undefined && score !== null) {
      user.challengeScores = [...(user.challengeScores || []), score];
      user.averageScore = Math.round(
        user.challengeScores.reduce((sum, value) => sum + value, 0) / user.challengeScores.length
      );
    }

    user.completedChallenges.push(challengeId);
    updateSkillsFromChallenge(user, challengeId);

    // ⚡ CHECK IF DOUBLE XP IS ACTIVE
    let actualXp = xpAward;
    if (user.doubleXpExpires && new Date() < user.doubleXpExpires) {
      actualXp = xpAward * 2;
    } else if (user.doubleXpExpires && new Date() >= user.doubleXpExpires) {
      // 🕐 DOUBLE XP EXPIRED - CLEAR IT
      user.doubleXpExpires = null;
    }
    
    user.xp = (user.xp || 0) + actualXp;
    user.level = Math.floor(user.xp / 2000) + 1;
    ensureUnlockedPaths(user);
    await user.save();

    res.json({
      message: "Challenge completed!",
      user
    });
  } catch (error) {
    console.error("Challenge Completion Error:", error);
    res.status(500).json({ message: "Error completing challenge" });
  }
});

router.post("/challenge-attempt", protect, async (req, res) => {
  try {
    const { challengeId, score, success, xpAward = 0, prerequisites = [] } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (prerequisites.length > 0) {
      const met = prerequisites.every((id) => user.completedModules.includes(id));
      if (!met) return res.status(403).json({ message: "Prerequisites not met!" });
    }

    user.challengeAttempts = (user.challengeAttempts || 0) + 1;
    if (!success) {
      user.challengeFailures = (user.challengeFailures || 0) + 1;
    }

    if (score !== undefined && score !== null) {
      user.challengeScores = [...(user.challengeScores || []), score];
      user.averageScore = Math.round(
        user.challengeScores.reduce((sum, value) => sum + value, 0) / user.challengeScores.length
      );
    }

    if (success) {
      if (user.completedChallenges.includes(challengeId)) {
        return res.status(400).json({ message: "Challenge already completed" });
      }

      user.completedChallenges.push(challengeId);
      updateSkillsFromChallenge(user, challengeId);

      let actualXp = xpAward;
      if (user.doubleXpExpires && new Date() < user.doubleXpExpires) {
        actualXp = xpAward * 2;
      } else if (user.doubleXpExpires && new Date() >= user.doubleXpExpires) {
        user.doubleXpExpires = null;
      }
      user.xp = (user.xp || 0) + actualXp;
      user.level = Math.floor(user.xp / 2000) + 1;
    }

    ensureUnlockedPaths(user);
    await user.save();

    res.json({
      message: success ? "Challenge attempt completed" : "Challenge attempt recorded",
      user
    });
  } catch (error) {
    console.error("Challenge Attempt Error:", error);
    res.status(500).json({ message: "Error recording challenge attempt" });
  }
});

/* ==========================================
   5. GOOGLE OAUTH
   ========================================== */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    // Generate the JWT token here
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
   
    // Redirect to frontend with token AND name/username to satisfy your Login.jsx useEffect
    res.redirect(`http://localhost:5173/login?token=${token}&username=${req.user.name || req.user.email.split('@')[0]}`);
  }
);

/* ==========================================
   6. PASSWORD RESET
   ========================================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "Reset link sent if account exists." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendResetEmail(user.email, resetToken);
    res.json({ message: "Reset link sent!" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid/Expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password updated!" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

export default router;