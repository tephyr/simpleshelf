import {series} from 'gulp';
import {appBundlerFn} from './util-bundlers';
import {copyTestLib} from './copy-test-lib';
import {bundleTestLib} from './bundle-test-lib';
import {uiTest} from './ui-test';

/**
 * Run all test build tasks.
 **/
export const _buildTests = function() {
    // Lastly, bundle the test code (app/code/test/...).
    return appBundlerFn({
        entries: './app/code/test/testIndex.js',
        paths: global.settings.extraPaths,
        isDebug: global.settings.isDebug,
        vendorLibraries: global.settings.libraryModules,
        destinationName: 'test.bundle.js',
        destinationDir: global.settings.testOutputPath
    });
};

export const buildTests = series(copyTestLib, bundleTestLib, uiTest, _buildTests);
