module.exports = function(gulp, settings) {
    /**
     * Reload the browserSync object.
     */
    gulp.task('browser-sync-reload', gulp.series('build-tests', function(cb){
        settings.dynamic.browserSync.reload();
        cb();
    }));
};
