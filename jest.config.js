//@ts-check

/** @type{import('@jest/types').Config.InitialOptions} */
const config = {
    // preset: 'jest-puppeteer',
    testPathIgnorePatterns: ['/build/', '/fixtures/'],
    transform: {
        '^.+\\.tsx?$': 'esbuild-runner/jest',
    },
    rootDir: 'test',
}

module.exports = config
