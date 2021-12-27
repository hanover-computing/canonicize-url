process.env.JEST_JUNIT_OUTPUT_DIR = 'reports/jest'

module.exports = {
  coverageThreshold: {
    global: {
      branches: 80
    }
  },
  reporters: ['default', 'jest-junit'],
  errorOnDeprecated: true,
  notify: true,
  testEnvironment: 'jest-environment-node',
  transform: {},
  resolver: '<rootDir>/esm-resolver.cjs'
}
