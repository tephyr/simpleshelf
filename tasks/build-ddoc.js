module.exports = function(gulp, settings) {
    /**
     * Copy design doc files to output.
     **/
    gulp.task('build-ddoc', function (cb) {
        return gulp.src(settings.globs.ddoc)
            .pipe(gulp.dest(settings.ddocOutput));
    });
};
