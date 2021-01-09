/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  name: 'dbtest',
  displayName: 'Database Tests',
  rootDir: '../../../../',
  testMatch: ['**/*.test.db.[jt]s?(x)'],
  setupFilesAfterEnv: [path.join(__dirname, './teardown.ts')],
  testEnvironment: path.join(__dirname, './prisma-test-env.js'),
};
