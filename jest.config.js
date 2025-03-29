module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'lcov'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
