module.exports = function(gulp, settings) {
    var appBundlerFn = require("./app-bundler")(gulp, settings).appBundlerFn;

    /**
     * Bundle production-ready code.
     **/
    gulp.task('code', function () {
        return appBundlerFn(false);
    });
};
