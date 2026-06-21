import mongoose from "mongoose";

const dailyProblemSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    problem: {
      id: String,
      title: String,
      difficulty: String,
      description: String,
      xpReward: Number,
      coinsReward: Number,
      timeEstimate: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("DailyProblem", dailyProblemSchema);