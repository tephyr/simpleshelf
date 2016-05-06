module.exports = function(gulp, settings) {
    /**
     * Reload the browserSync object.
     */
    gulp.task('browser-sync-reload', ['build-tests'], function(cb){
        settings.dynamic.browserSync.reload();
        cb();
    });
};
