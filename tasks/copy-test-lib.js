module.exports = function(gulp, settings) {
    /**
     * Copy all 3rd-party test libraries to output/.
     **/
    gulp.task('copy-test-lib', function() {
        var libPaths = [
            './node_modules/mocha/mocha.js',
            './node_modules/chai/chai.js'
        ];
        return gulp.src(libPaths)
            .pipe(gulp.dest(settings.testOutputPath));
    });
};
