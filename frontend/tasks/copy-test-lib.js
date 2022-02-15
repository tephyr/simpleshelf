import {src, dest, pipe} from 'gulp';

/**
 * Copy all 3rd-party test libraries to output/.
 **/
export const copyTestLib = function() {
    const libPaths = [
        './node_modules/mocha/mocha.js',
        './node_modules/chai/chai.js'
    ];

    return src(libPaths)
        .pipe(dest(global.settings.testOutputPath));
};
