import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: String,
    googleId: String,

    // PROGRESS
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 100 },
    completedModules: { type: [String], default: [] },
    completedChallenges: { type: [String], default: [] },
    completedPaths: { type: [String], default: [] },
    unlockedPaths: { type: [String], default: ["1", "2"] },
    challengeAttempts: { type: Number, default: 0 },
    challengeFailures: { type: Number, default: 0 },
    challengeScores: { type: [Number], default: [] },
    averageScore: { type: Number, default: 0 },
    skills: {
      Python: { type: Number, default: 0 },
      SQL: { type: Number, default: 0 },
      Stats: { type: Number, default: 0 },
      ML: { type: Number, default: 0 },
      DataViz: { type: Number, default: 0 },
      DeepLearning: { type: Number, default: 0 }
    },

    // 🔥 STREAK SYSTEM (BASED ON DAILY PROBLEMS)
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    streakFreezeActive: { type: Boolean, default: false },
    problemsSolvedDates: { type: [Date], default: [] }, // ✅ Track dates when user solved daily problem
    lastProblemSolvedDate: { type: Date }, // ✅ When user last solved daily problem

    // 🛒 INVENTORY SYSTEM
    inventory: {
      freeze: { type: Number, default: 0 },
      doublexp: { type: Number, default: 0 },
      hint: { type: Number, default: 0 },
      skip: { type: Number, default: 0 }
    },

    // ⚡ ACTIVE EFFECTS
    doubleXpExpires: { type: Date, default: null },

    avatar: { type: String, default: "🐱" },

    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);