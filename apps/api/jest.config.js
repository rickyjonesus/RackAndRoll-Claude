/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          keepClassNames: true,
          target: 'es2021',
        },
        module: { type: 'commonjs' },
      },
    ],
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverageFrom: ['**/*.service.ts', '!**/prisma.service.ts'],
  coverageDirectory: '../coverage',
};
