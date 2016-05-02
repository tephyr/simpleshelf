module.exports = function(gulp, settings) {
    var appBundlerFn = require("./util-bundlers.js")(gulp, settings).appBundlerFn;

    /**
     * Bundle production-ready code.
     **/
    gulp.task('code', function () {
        return appBundlerFn('app/code/main.js', false,
            settings.libraryModules, 'app.bundle.js', settings.codeOutputPath);
    });
};
