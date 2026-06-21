// Daily Problem Pool - All available problems (fields match DailyProblem model)
const PROBLEM_POOL = [
  { id: 'c1', title: "Statistical Hypothesis Testing", difficulty: "MEDIUM", description: "Analyze A/B testing results.", xpReward: 300, coinsReward: 120, timeEstimate: "40m" },
  { id: 'c2', title: "Linear Regression from Scratch", difficulty: "HARD", description: "Build a regression model.", xpReward: 500, coinsReward: 200, timeEstimate: "60m" },
  { id: 'c3', title: "Pandas Data Cleaning", difficulty: "MEDIUM", description: "Clean a messy dataset.", xpReward: 250, coinsReward: 100, timeEstimate: "30m" },
  { id: 'c4', title: "NLP Sentiment Analysis", difficulty: "HARD", description: "Classify text sentiment.", xpReward: 500, coinsReward: 200, timeEstimate: "60m" },
  { id: 'c5', title: "Time Series Forecasting", difficulty: "HARD", description: "Predict future values.", xpReward: 550, coinsReward: 220, timeEstimate: "75m" },
  { id: 'c6', title: "Python List Comprehension", difficulty: "EASY", description: "Master Python syntax.", xpReward: 100, coinsReward: 50, timeEstimate: "15m" },
  { id: 'c7', title: "Data Visualization with Matplotlib", difficulty: "MEDIUM", description: "Create meaningful visualizations.", xpReward: 200, coinsReward: 80, timeEstimate: "30m" },
  { id: 'c8', title: "SQL Query Optimization", difficulty: "MEDIUM", description: "Optimize slow database queries.", xpReward: 280, coinsReward: 110, timeEstimate: "35m" },
  { id: 'c9', title: "Feature Engineering Basics", difficulty: "MEDIUM", description: "Extract and create features.", xpReward: 300, coinsReward: 130, timeEstimate: "45m" },
  { id: 'c10', title: "Regular Expressions Mastery", difficulty: "MEDIUM", description: "Master pattern matching.", xpReward: 200, coinsReward: 90, timeEstimate: "25m" },
];

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .split('T')[0];
};

// Generate daily problem for a given date (deterministic)
export const generateDailyProblems = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const seed = (year + month + day) % PROBLEM_POOL.length;
  return PROBLEM_POOL[seed];
};

// Calculate streak based on problem solving history
export const calculateStreak = (problemsSolvedDates) => {
  if (!problemsSolvedDates || problemsSolvedDates.length === 0) {
    return 0;
  }

  // Convert to UTC dates for comparison
  const sortedDates = problemsSolvedDates
    .map(d => new Date(d))
    .map(d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())))
    .sort((a, b) => b - a);

  let streak = 1;
  const today = new Date();
  const todayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // Start from the most recent date
  let currentDate = sortedDates[0];

  // If the last problem solved was not today or yesterday, streak is broken
  const diffFromToday = Math.floor((todayDate - currentDate) / (1000 * 60 * 60 * 24));
  if (diffFromToday > 1) {
    return 0;
  }

  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i];
    const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};
