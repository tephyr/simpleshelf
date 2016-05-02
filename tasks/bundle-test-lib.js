module.exports = function(gulp, settings) {
    var libBundlerFn = require('./util-bundlers.js')(gulp, settings).libBundlerFn;

    /**
     * Combine all app/code/lib libraries, *in order*, to testlib.bundle.js.
     **/
    gulp.task('bundle-test-lib', function() {
        return libBundlerFn(settings.libraryModules, 'testlib.bundle.js', settings.testOutputPath);
    });
};
