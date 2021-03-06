import {series} from 'gulp';
import {buildTests} from './build-tests';
import {browserSyncInit} from './browser-sync-init';

/**
 * Test in browser, via BrowserSync.
 */
function _testInBrowser(cb) {
    // gulp.series('build-tests', 'browser-sync-init', function(cb){
    global.settings.dynamic.browserSync.reload();
    cb();
};

export const testInBrowser = series(buildTests, browserSyncInit, _testInBrowser);
