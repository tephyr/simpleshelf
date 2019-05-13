import {libBundlerFn} from './util-bundlers';

/**
 * Combine all app/code/lib libraries, *in order*, to testlib.bundle.js.
 **/
export const bundleTestLib = function() {
    return libBundlerFn(global.settings.libraryModules, 'testlib.bundle.js', global.settings.testOutputPath);
};
