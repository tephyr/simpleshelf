module.exports = function(gulp, settings) {
    var appBundlerFn = require("./util-bundlers.js")(gulp, settings).appBundlerFn;

    /**
     * Bundle debug-ready javascript.
     **/
    gulp.task('code-dev', function (cb) {
        return appBundlerFn('app/code/main.js', settings.isDebug,
            settings.libraryModules, 'app.bundle.js', settings.codeOutputPath);
    });
};
