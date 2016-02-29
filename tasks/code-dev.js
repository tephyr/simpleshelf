module.exports = function(gulp, settings) {
    var appBundlerFn = require("./app-bundler")(gulp, settings).appBundlerFn;

    /**
     * Bundle debug-ready javascript.
     **/
    gulp.task('code-dev', function (cb) {
        return appBundlerFn(settings.isDebug);
    });
};
