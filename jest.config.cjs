/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/assets/**",
    // Excluir arquivos grandes ou que dependem fortemente de ambiente (canvas/audio)
    // para um relatório de cobertura com escopo reduzido e mais representativo
    // do código testado atualmente.
    "!src/components/Game.tsx",
    "!src/components/DevelopmentCardsModal.tsx",
    "!src/input/GameInputController.ts",
    "!src/core/game/BotController.ts",
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
