module.exports = function(gulp, settings) {
    var appBundlerFn = require("./util-bundlers.js")(gulp, settings).appBundlerFn;

    /**
     * Run all test build tasks.
     **/
    gulp.task('build-tests', gulp.series('copy-test-lib', 'bundle-test-lib', 'ui-test', function () {
        // Lastly, bundle the test code (app/code/test/...).
        return appBundlerFn({
            entries: './app/code/test/testIndex.js',
            paths: settings.extraPaths,
            isDebug: settings.isDebug,
            vendorLibraries: settings.libraryModules,
            destinationName: 'test.bundle.js',
            destinationDir: settings.testOutputPath
        });
    }));
};
