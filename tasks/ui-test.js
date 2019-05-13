import {src, dest} from 'gulp';
const merge = require('merge-stream'),
    path = require('path');

/**
 * Copy HTML & CSS files to test output.
 **/
export const uiTest = function() {
    const mochaCSS = src(settings.externalUICSSTest)
        .pipe(dest(settings.testOutputPath));

    const testUI = src(path.join(settings.testSource, '*.html'))
        .pipe(dest(settings.testOutputPath));

    return merge(mochaCSS, testUI);
};
