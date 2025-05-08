module.exports = {
  // Coverage does not work with expo-module-scripts, so we use jest-expo instead
  preset: 'jest-expo',
  // collectCoverage: true,
  collectCoverageFrom: [
    'plugin/src/**/*.{js,jsx,ts,tsx}',
    '!plugin/src/**/*.d.ts',
    '!plugin/src/**/*.test.{js,jsx,ts,tsx}',
    '!plugin/src/**/__tests__/**',
    '!plugin/src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
