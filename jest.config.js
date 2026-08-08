export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  coverageDirectory: "coverage",
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/"],
};
