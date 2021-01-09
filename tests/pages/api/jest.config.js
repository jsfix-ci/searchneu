module.exports = {
  name: 'dbtest',
  displayName: 'Database Tests',
  rootDir: '../../../',
  testMatch: ['**/*.test.db.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/pages/api/teardown.ts'],
  testEnvironment: '<rootDir>/tests/pages/api/prisma-test-env.ts',
};
