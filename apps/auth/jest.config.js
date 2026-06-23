module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    watchman: false,
    testMatch: ['**/spec/**/*.spec.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
    moduleNameMapper: {
        '^db$': '<rootDir>/../../packages/db/src/index.ts',
    },
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/**/*.d.ts',
        '!**/node_modules/**',
    ],
};
