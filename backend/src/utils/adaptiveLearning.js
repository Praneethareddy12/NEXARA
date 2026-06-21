const LEARNING_PATHS = [
  {
    id: "1",
    title: "Python Fundamentals",
    category: "Fundamentals",
    level: "Beginner",
    modules: 4,
    skillWeights: { Python: 1, DataViz: 0.4 }
  },
  {
    id: "2",
    title: "Python for Data Science",
    category: "Programming",
    level: "Beginner",
    modules: 4,
    skillWeights: { Python: 1, DataViz: 0.8 }
  },
  {
    id: "3",
    title: "NumPy & Pandas Mastery",
    category: "Data Engineering",
    level: "Intermediate",
    modules: 4,
    skillWeights: { Python: 0.8, SQL: 0.6, DataViz: 0.7 }
  },
  {
    id: "4",
    title: "Statistics & Probability",
    category: "Statistics",
    level: "Intermediate",
    modules: 4,
    skillWeights: { Stats: 1, ML: 0.6 }
  },
  {
    id: "5",
    title: "Machine Learning Foundations",
    category: "Machine Learning",
    level: "Advanced",
    modules: 4,
    skillWeights: { ML: 1, Stats: 0.7 }
  },
  {
    id: "6",
    title: "Deep Learning & Neural Networks",
    category: "Deep Learning",
    level: "Expert",
    modules: 4,
    skillWeights: { DeepLearning: 1, ML: 0.7 }
  }
];

const CHALLENGE_SKILL_MAP = {
  c1: { Stats: 0.9 },
  c2: { ML: 1 },
  c3: { DataViz: 0.8 },
  c4: { ML: 0.9 },
  c5: { ML: 0.9, Stats: 0.6 },
  c6: { Python: 0.8 },
  c7: { DataViz: 0.9 },
  c8: { SQL: 0.9 },
  c9: { Python: 0.7, DataViz: 0.5 },
  c10: { Python: 0.6 },
  'boss-1': { ML: 1, Stats: 0.6 },
  'boss-2': { DeepLearning: 1 },
  'boss-3': { ML: 0.9, DeepLearning: 0.8 }
};

const DEFAULT_SKILLS = {
  Python: 0,
  SQL: 0,
  Stats: 0,
  ML: 0,
  DataViz: 0,
  DeepLearning: 0
};

export const getDefaultSkills = () => ({ ...DEFAULT_SKILLS });

export const completePathProgress = (user, pathId) => {
  const completedModules = user.completedModules || [];
  const totalModules = LEARNING_PATHS.find((path) => path.id === pathId)?.modules || 0;
  const completedCount = completedModules.filter((mod) => mod.startsWith(`${pathId}-`)).length;
  return {
    pathId,
    totalModules,
    completedModules: completedCount,
    progress: totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0,
    status:
      completedCount >= totalModules
        ? "Completed"
        : completedCount > 0
        ? "In Progress"
        : "Not Started"
  };
};

export const computeUnlockedPaths = (user) => {
  const completed = new Set(user.completedPaths || []);
  const unlocked = new Set(user.unlockedPaths || []);

  unlocked.add("1");
  unlocked.add("2");

  if (completed.has("1") || completed.has("2")) {
    unlocked.add("3");
  }

  if (completed.has("2") || completed.has("3")) {
    unlocked.add("4");
  }

  if (completed.has("4")) {
    unlocked.add("5");
  }

  if (completed.has("5")) {
    unlocked.add("6");
  }

  return Array.from(unlocked).sort((a, b) => Number(a) - Number(b));
};

export const ensureUnlockedPaths = (user) => {
  const unlockedPaths = computeUnlockedPaths(user);
  user.unlockedPaths = unlockedPaths;
  return unlockedPaths;
};

export const buildLearningPathInsights = (user) => {
  const unlockedPaths = new Set(computeUnlockedPaths(user));
  return LEARNING_PATHS.map((path) => {
    const pathProgress = completePathProgress(user, path.id);
    const isUnlocked = unlockedPaths.has(path.id);
    return {
      ...path,
      ...pathProgress,
      unlocked: isUnlocked,
      recommended: pathProgress.progress < 100 && isUnlocked,
      reason: pathProgress.status === "Completed"
        ? "Path completed"
        : isUnlocked
        ? `Build ${Object.keys(path.skillWeights).join(", ")} strength.`
        : "Unlock prerequisites to start this path"
    };
  });
};

export const getUserSkillProfile = (user) => {
  const skills = user.skills ? { ...DEFAULT_SKILLS, ...user.skills } : getDefaultSkills();
  const totals = Object.values(skills).reduce((sum, value) => sum + value, 0);

  const strengths = Object.entries(skills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill, score]) => ({ skill, score }));

  const weaknesses = Object.entries(skills)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([skill, score]) => ({ skill, score }));

  return {
    skills,
    strengths,
    weaknesses,
    overallProgress: Math.min(100, Math.round((totals / (LEARNING_PATHS.length * 40)) * 100))
  };
};

const getLowestSkillScore = (skillProfile) => {
  return Object.entries(skillProfile.skills)
    .sort((a, b) => a[1] - b[1])
    .map(([skill]) => skill);
};

export const recommendLearningPaths = (user) => {
  const skillProfile = getUserSkillProfile(user);
  const unlockedPaths = new Set(computeUnlockedPaths(user));

  return LEARNING_PATHS.filter((path) => unlockedPaths.has(path.id))
    .map((path) => {
      const pathProgress = completePathProgress(user, path.id);
      const levelOrder = ["Beginner", "Intermediate", "Advanced", "Expert"];
      const userLevel = user.level || 1;
      const allowedIndex = levelOrder.indexOf(path.level);

      const skillAlignment = Object.entries(path.skillWeights).reduce(
        (sum, [skill, weight]) => sum + weight * (100 - (skillProfile.skills[skill] || 0)),
        0
      );

      const score = skillAlignment + (100 - pathProgress.progress) * 0.5 - Math.max(0, allowedIndex - (userLevel - 1)) * 15;

      return {
        ...path,
        ...pathProgress,
        score,
        recommended: pathProgress.progress < 100
      };
    })
    .filter((path) => path.status !== "Completed")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const recommendChallenge = (user) => {
  const completed = new Set(user.completedChallenges || []);
  const skillProfile = getUserSkillProfile(user);
  const weakSkills = new Set(skillProfile.weaknesses.map((item) => item.skill));

  const candidateChallenges = Object.entries(CHALLENGE_SKILL_MAP)
    .filter(([id]) => !completed.has(id))
    .map(([id, skillWeights]) => {
      const score = Object.entries(skillWeights).reduce((sum, [skill, weight]) => {
        return sum + (weakSkills.has(skill) ? weight * 20 : weight * 10);
      }, 0);
      return { id, skillWeights, score };
    })
    .sort((a, b) => b.score - a.score);

  return candidateChallenges[0] || null;
};

export const updateSkillsFromModule = (user, moduleId) => {
  const pathMapping = {
    1: ["Python"],
    2: ["Python", "DataViz"],
    3: ["Python", "SQL", "DataViz"],
    4: ["Stats", "ML"],
    5: ["ML", "Stats"],
    6: ["DeepLearning", "ML"]
  };
  const skillsToAdd = pathMapping[moduleId] || [];
  if (!user.skills) user.skills = getDefaultSkills();

  skillsToAdd.forEach((skill) => {
    user.skills[skill] = (user.skills[skill] || 0) + 10;
  });
};

export const updateSkillsFromChallenge = (user, challengeId) => {
  if (!user.skills) user.skills = getDefaultSkills();
  const skillWeights = CHALLENGE_SKILL_MAP[challengeId] || {};
  Object.entries(skillWeights).forEach(([skill, weight]) => {
    user.skills[skill] = (user.skills[skill] || 0) + Math.round(10 * weight);
  });
};

export const syncSkillProfile = (user) => {
  if (!user.skills) user.skills = getDefaultSkills();
  return getUserSkillProfile(user);
};

export const getDailyProblemCompletionRate = (user) => {
  const solvedDates = (user.problemsSolvedDates || []).map((date) => new Date(date).toISOString().split("T")[0]);
  if (!solvedDates.length) return 0;

  const uniqueDays = [...new Set(solvedDates)];
  const today = new Date();
  const cutoff = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  cutoff.setUTCDate(cutoff.getUTCDate() - 29);

  const recentCompletions = uniqueDays.filter((day) => new Date(day).getTime() >= cutoff.getTime());
  return Math.round((recentCompletions.length / 30) * 100);
};

export const getChallengeStats = (user) => {
  const attempts = user.challengeAttempts || 0;
  const failures = user.challengeFailures || 0;
  const averageScore = user.averageScore || 0;
  const successRate = attempts ? Math.round(((attempts - failures) / attempts) * 100) : 0;

  return {
    attempts,
    failures,
    averageScore,
    successRate,
    completedChallenges: (user.completedChallenges || []).length
  };
};

export const getLearningPathSummaries = (user) => {
  const unlockedPaths = new Set(computeUnlockedPaths(user));
  return LEARNING_PATHS.map((path) => {
    const pathProgress = completePathProgress(user, path.id);
    const isUnlocked = unlockedPaths.has(path.id);
    return {
      id: path.id,
      title: path.title,
      category: path.category,
      level: path.level,
      modules: path.modules,
      progress: pathProgress.progress,
      status: pathProgress.status,
      completedModules: pathProgress.completedModules,
      unlocked: isUnlocked,
      reason: pathProgress.status === "Completed" ? "Completed" : isUnlocked ? "Strong fit for skill growth" : "Unlock prerequisites to start this path"
    };
  });
};

export const getAdaptivePayload = (user) => {
  ensureUnlockedPaths(user);
  return {
    skillProfile: syncSkillProfile(user),
    recommendedPaths: recommendLearningPaths(user),
    recommendedChallenge: recommendChallenge(user),
    learningPathInsights: getLearningPathSummaries(user),
    unlockedPaths: user.unlockedPaths,
    challengeStats: getChallengeStats(user),
    dailyProblemCompletionRate: getDailyProblemCompletionRate(user)
  };
};

export default {
  LEARNING_PATHS,
  getDefaultSkills,
  completePathProgress,
  computeUnlockedPaths,
  ensureUnlockedPaths,
  buildLearningPathInsights,
  getUserSkillProfile,
  recommendLearningPaths,
  recommendChallenge,
  updateSkillsFromModule,
  updateSkillsFromChallenge,
  syncSkillProfile,
  getDailyProblemCompletionRate,
  getChallengeStats,
  getLearningPathSummaries,
  getAdaptivePayload
};
