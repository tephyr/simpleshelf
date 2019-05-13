import {series} from 'gulp';

import {buildTests} from './build-tests';

/**
 * Reload the browserSync object.
 */
const _browserSyncReload = function(cb){
    global.settings.dynamic.browserSync.reload();
    cb();
};

export const browserSyncReload = series(buildTests, _browserSyncReload);
