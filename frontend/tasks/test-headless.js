const { series, src, pipe } = require('gulp');
const path = require('path');
import mochaHeadless from 'gulp-mocha-chrome';
import { buildTests } from './build-tests.js';

/**
 * Run tests in console using a headless browser.
 */
const _testHeadless = function() {
    return src(path.join(global.settings.testOutputPath, 'index.html'))
        .pipe(mochaHeadless({reporter: 'dot'}));
}

export const testHeadless = series(buildTests, _testHeadless);
