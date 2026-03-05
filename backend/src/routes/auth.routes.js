import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "passport";
import User from "../models/User.js";
import { sendResetEmail } from "../utils/sendEmail.js";
import { protect } from "../middlewares/auth.middleware.js";

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
      streak: 0,
      lastLoginDate: new Date(),
      streakFreezeActive: false 
    });

    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ==========================================
   2. LOGIN (Sign In) - REFINED STREAK LOGIC
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

    // --- DYNAMIC STREAK & FREEZE CALCULATION ---
    const now = new Date();
    // Normalize to Midnight UTC to avoid timezone/DST issues
    const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    
    if (!lastLogin) {
      user.streak = 1;
    } else {
      const lastDate = new Date(Date.UTC(lastLogin.getUTCFullYear(), lastLogin.getUTCMonth(), lastLogin.getUTCDate()));
      
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Successive day
        user.streak += 1;
      } else if (diffDays > 1) {
        // User missed a day - Check for Freeze
        if (user.streakFreezeActive) {
          user.streakFreezeActive = false; // Item consumed
          // Streak remains as it was
        } else {
          user.streak = 1; // Reset to 1
        }
      }
      // if diffDays === 0, user already logged in today, keep current streak.
    }

    if (user.streak > (user.bestStreak || 0)) {
      user.bestStreak = user.streak;
    }
    
    user.lastLoginDate = now; 
    await user.save(); 
    // ------------------------------------------

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
        streakFreezeActive: user.streakFreezeActive
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ==========================================
   3. SHOP & LEADERBOARD
   ========================================== */

router.post("/buy-freeze", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.coins < 50) {
      return res.status(400).json({ message: "Not enough coins! You need 50." });
    }
    if (user.streakFreezeActive) {
      return res.status(400).json({ message: "You already have an active freeze!" });
    }

    user.coins -= 50;
    user.streakFreezeActive = true;
    await user.save();

    res.json({ 
      message: "Streak Freeze Activated! Your streak is protected.", 
      coins: user.coins 
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing purchase" });
  }
});

// ADDED LEADERBOARD ROUTE
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
   4. PROGRESS & PROFILE
   ========================================== */

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/update-progress", protect, async (req, res) => {
  try {
    const { xpToAdd, moduleId, moduleIndex } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (xpToAdd) {
      user.xp = (user.xp || 0) + xpToAdd;
    }

    const oldLevel = user.level || 1;
    const newLevel = Math.floor(user.xp / 2000) + 1;
    
    if (newLevel > oldLevel) {
      user.level = newLevel;
    }

    const progressKey = `${moduleId}-${moduleIndex}`;
    if (!user.completedModules.includes(progressKey)) {
      user.completedModules.push(progressKey);
    }

    await user.save();
    res.json({ 
      message: "Progress saved", 
      xp: user.xp, 
      level: user.level 
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error saving progress" });
  }
});

// NEW: Challenge Completion Route (Checklist Requirement)
router.post("/complete-challenge", protect, async (req, res) => {
  try {
    const { challengeId, xpAward, prerequisites } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Prerequisite Check
    if (prerequisites && prerequisites.length > 0) {
      const met = prerequisites.every(id => user.completedModules.includes(id));
      if (!met) return res.status(403).json({ message: "Prerequisites not met!" });
    }

    // 2. Prevent Double Completion
    if (user.completedChallenges.includes(challengeId)) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    // 3. Update State
    user.completedChallenges.push(challengeId);
    user.xp = (user.xp || 0) + xpAward;
    user.level = Math.floor(user.xp / 2000) + 1;
    await user.save();

    res.json({ message: "Challenge completed!", xp: user.xp, level: user.level });
  } catch (error) {
    console.error("Challenge Completion Error:", error);
    res.status(500).json({ message: "Error completing challenge" });
  }
});

/* ==========================================
   5. GOOGLE OAUTH
   ========================================== */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
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