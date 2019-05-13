import _ from 'lodash';
import {series} from 'gulp';
import * as browserSyncModule from 'browser-sync';
import {buildTests} from './build-tests';

/**
 * Initialize the browser sync server (static).
 */
export const _browserSyncInit = function(cb) {
    if (!_.has(global.settings, 'dynamic.browserSync')) {
        // Create the browserSync server.
        global.settings.dynamic.browserSync = browserSyncModule.create();
    }

    global.settings.dynamic.browserSync.init({
        server: {
            baseDir: global.settings.testOutputPath
        }
    });
    cb();
};

export const browserSyncInit = series(buildTests, _browserSyncInit);
