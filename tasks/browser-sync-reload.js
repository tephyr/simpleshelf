module.exports = function(gulp, settings) {

    /**
     * Reload the browserSync object.
     */
    gulp.task('browser-sync-reload', ['test-phantom'], function(cb){
        settings.dynamic.browserSync.reload();
        cb();
    });
};
