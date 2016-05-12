module.exports = function(gulp, settings) {
    // Create the browserSync server.
    settings.dynamic.browserSync = require('browser-sync').create();

    /**
     * Initialize the browser sync server (static).
     */
    gulp.task('browser-sync-init', ['build-tests'], function(cb) {
        settings.dynamic.browserSync.init({
            server: {
                baseDir: settings.testOutputPath
            }
        });
        cb();
    });
};
