/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/env.ts"],
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  setupFilesAfterEnv: ["<rootDir>/tests/teardown.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { isolatedModules: true }],
  },
  testTimeout: 20000,
};
