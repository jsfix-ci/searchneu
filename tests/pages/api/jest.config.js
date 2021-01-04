module.exports = {
  name: 'dbtest',
  displayName: 'Database Tests',
  rootDir: '../../../',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'tsx', 'ts'],
  testMatch: ['**/*.{spec,test}.db.[jt]s?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/backend/tests/jest.config.js',
    '<rootDir>/node_modules',
    '<rootDir>/dist/',
  ],
  setupFiles: ['<rootDir>/tests/pages/api/jestSetupFile.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/pages/api/teardown.ts'],
  testEnvironment: '<rootDir>/tests/pages/api/db_test_env.ts',
};
