import {appBundlerFn} from './util-bundlers';

/**
 * Bundle debug-ready javascript.
 **/
export const code = function (cb) {
    return appBundlerFn({
        entries: 'app/code/main.js',
        paths: settings.extraPaths,
        isDebug: settings.isDebug,
        vendorLibraries: settings.libraryModules,
        destinationName: 'app.bundle.js',
        destinationDir: settings.codeOutputPath
    });
};
