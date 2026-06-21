import adaptive from '../src/utils/adaptiveLearning.js';

const { getDefaultSkills, updateSkillsFromModule, updateSkillsFromChallenge, recommendLearningPaths, recommendChallenge, getUserSkillProfile } = adaptive;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAILED:', msg);
    process.exit(1);
  }
}

(async () => {
  console.log('Running adaptive utilities tests...');

  // Test default skills
  const defaults = getDefaultSkills();
  assert(typeof defaults === 'object', 'getDefaultSkills should return object');
  assert('Python' in defaults, 'Default skills should include Python');

  // Test updating skills from module
  const userA = { skills: getDefaultSkills() };
  updateSkillsFromModule(userA, '1');
  assert(userA.skills.Python > 0, 'updateSkillsFromModule should increase Python skill');

  // Test updating skills from challenge
  const userB = { skills: getDefaultSkills() };
  updateSkillsFromChallenge(userB, 'c2');
  assert(userB.skills.ML > 0, 'updateSkillsFromChallenge should increase ML skill for c2');

  // Test skill profile
  const profile = getUserSkillProfile(userB);
  assert(profile.strengths && profile.weaknesses, 'getUserSkillProfile should return strengths and weaknesses');

  // Test recommendations (no crash)
  const recs = recommendLearningPaths({ level: 1, skills: userB.skills, completedModules: [], completedChallenges: [] });
  assert(Array.isArray(recs), 'recommendLearningPaths should return an array');

  const recChallenge = recommendChallenge({ skills: userB.skills, completedChallenges: [] });
  // recChallenge may be null if none available, but function should run
  console.log('recommendChallenge result:', recChallenge);

  console.log('All adaptive tests passed.');
  process.exit(0);
})();
