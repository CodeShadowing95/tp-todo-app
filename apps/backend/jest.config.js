module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchman: false,
  testMatch: ['**/spec/**/*.spec.ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@dto/(.*)$': '<rootDir>/src/dto/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@persistence/(.*)$': '<rootDir>/src/persistence/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
  }
};