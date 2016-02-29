module.exports = function(gulp, settings) {
    var _ = require('lodash'),
        browserify = require('browserify'),
        gutil = require('gulp-util'),
        source = require('vinyl-source-stream');

    /**
     * Combine all app/code/lib libraries, *in order*, to a lib.bundle.js.
     **/
    gulp.task('bundle-lib', function() {
        // var libsInOrder = [
            // NOTE: using the following will require the jquery.couch.js file, typically
            // available under /_utils/script/jquery.couch.js.
            // 'jquery.couch.app.js',
            // 'jquery.couch.app.util.js',
            // 'jquery.couchForm.js',
            // 'jquery.mustache.js',
            // 'jquery.couchLogin.js',
            // 'jquery.couchProfile.js',
        // ];

        // idea courtesy http://stackoverflow.com/a/24876996/562978
        // List all 3rd-party libraries (all of which are node modules), and ``require`` them
        // in this bundle (``lib.bundle.js``).
        // Do **not** list them in the browserify() call, otherwise it will search for a *file*
        // by that name.
        var vendor = browserify();
        _.each(settings.libraryModules, function(lib) {
            vendor.require(lib);
        })

        // Return so gulp knows when task finishes.
        return vendor.bundle()
            .pipe(source('lib.bundle.js'))            // give destination filename
            .pipe(gulp.dest(settings.codeOutputPath)) // give destination directory
            .on('error', gutil.log);
    });
};
