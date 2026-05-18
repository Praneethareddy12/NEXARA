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

    // STREAK
    streak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: Date.now },
    bestStreak: { type: Number, default: 0 },
    streakFreezeActive: { type: Boolean, default: false },

    // 🛒 INVENTORY SYSTEM
    inventory: {
      freeze: { type: Number, default: 0 },
      doublexp: { type: Number, default: 0 },
      hint: { type: Number, default: 0 },
      skip: { type: Number, default: 0 }
    },

    // ⚡ ACTIVE EFFECTS
    activeEffects: {
      doubleXP: { type: Date, default: null }
    },

    lastActiveDate: { type: Date },

    avatar: { type: String, default: "🐱" },

    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);