module.exports = function(gulp, settings) {
    var _ = require('lodash'),
        browserify = require('browserify'),
        gutil = require('gulp-util'),
        source = require('vinyl-source-stream'),
        stringify = require('stringify');

    /**
     * Helper function: bundle application code.
     **/
    return {
        appBundlerFn: function(isDebug) {
            // set up the browserify instance on a task basis
            var b = browserify({
                entries: 'app/code/main.js',
                debug: isDebug,
                transform: stringify({
                    extensions: ['.html'],
                    minify: false
                })
            });

            // Ignore modules in lib.bundle.js.
            _.each(settings.libraryModules, function(lib) {
                b.exclude(lib);
            });

            // Return so gulp knows when task finishes.
            return b.bundle()
                .on('error', function(err) {
                    // print the error
                    gutil.log(gutil.colors.bgRed(err.message));
                    // end this stream (to prevent browserify from hanging the stream)
                    this.emit('end');
                }) // Set error handler
                .pipe(source('app.bundle.js')) // give destination filename
                .pipe(gulp.dest(settings.codeOutputPath)); // give destination directory
        }
    };
};