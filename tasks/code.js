module.exports = function(gulp, settings) {
    var appBundlerFn = require("./util-bundlers.js")(gulp, settings).appBundlerFn;

    /**
     * Bundle production-ready code.
     **/
    gulp.task('code', function () {
        return appBundlerFn({
            entries: 'app/code/main.js',
            paths: 'app/code/util/',
            isDebug: false,
            vendorLibraries: settings.libraryModules,
            destinationName: 'app.bundle.js',
            destinationDir: settings.codeOutputPath
        });
    });
};
