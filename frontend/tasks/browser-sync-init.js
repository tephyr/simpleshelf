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

    // If changing the web server's exposed port, the ``browserSyncProxy`` configuration value must change.
    // The proxy must be set to the **node web server** name, not "localhost" - this gulp task runs on the "js" Docker container,
    // but the web server it proxies is on the "web" container.
    global.settings.dynamic.browserSync.init({
        open: false,
        proxy: global.settings.browserSyncProxy
    });
    cb();
};

export const browserSyncInit = series(buildTests, _browserSyncInit);
