module.exports = function(gulp, settings) {
    /**
     * Test in browser, via BrowserSync.
     */
    gulp.task('test-in-browser', gulp.series('build-tests', 'browser-sync-init', function(cb){
        settings.dynamic.browserSync.reload();
        cb();
    }));
};
