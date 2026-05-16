import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    googleId: String,
    // --- Persistence Fields ---
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 100 },
    completedModules: { type: [String], default: [] }, 
    // --- New Streak & Challenge Fields ---
    streak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: Date.now },
    bestStreak: { type: Number, default: 0 },
    completedChallenges: { type: [String], default: [] },
    // --- Shop System ---
    streakFreezeActive: { type: Boolean, default: false },
    // ------------------------------
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);