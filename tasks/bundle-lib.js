import {libBundlerFn} from './util-bundlers';

/**
 * Combine all app/code/lib libraries, *in order*, to a lib.bundle.js.
 **/
export const bundleLib = function() {
    // var libsInOrder = [
        // NOTE: using the following will require the jquery.couch.js file, typically
        // available under /_utils/script/jquery.couch.js.
        // 'jquery.couch.app.js',
        // 'jquery.couch.app.util.js',
        // 'jquery.couchForm.js',
        // 'jquery.mustache.js',
        // 'jquery.couchLogin.js',
        // 'jquery.couchProfile.js',
    // ];

    return libBundlerFn(global.settings.libraryModules, 'lib.bundle.js', global.settings.codeOutputPath);
};
