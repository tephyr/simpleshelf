module.exports = function(gulp, settings) {
    var appBundlerFn = require("./util-bundlers.js")(gulp, settings).appBundlerFn;

    /**
     * Bundle debug-ready javascript.
     **/
    gulp.task('code-dev', function (cb) {
        return appBundlerFn({
            entries: 'app/code/main.js',
            paths: settings.extraPaths,
            isDebug: settings.isDebug,
            vendorLibraries: settings.libraryModules,
            destinationName: 'app.bundle.js',
            destinationDir: settings.codeOutputPath
        });
    });
};
