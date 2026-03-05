module.exports = {
  env: {
    node: true,     // This tells ESLint 'process' exists
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // Re-enable this so ESLint catches real typos in variable names
    "no-undef": "error", 
    "no-unused-vars": "warn"
  },
};