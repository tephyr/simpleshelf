const path = require('path'),
    sass = require('gulp-sass'),
    merge = require('merge-stream');

import {src, dest} from 'gulp';

/**
 * Build local SASS into CSS, copy any HTML or images.
 **/
export const uiLocal = function() {
    const uiFiles = src(settings.globs.directUI)
        .pipe(dest(path.join(settings.staticOutputPath)));

    const imageFiles = src(settings.globs.images)
        .pipe(dest(path.join(settings.staticOutputPath, 'img')));

    const buildSass = src(settings.globs.sass)
        .pipe(sass({
            includePaths: [
                './node_modules/bootstrap/scss'
            ]
        }).on('error', sass.logError))
        .pipe(dest(settings.styleOutputPath));

    return merge(buildSass, uiFiles, imageFiles);
};
