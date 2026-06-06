/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/assets/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov", "json-summary"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg|mp3|wav)$": "<rootDir>/tests/mocks/fileMock.ts",
  },
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
};
