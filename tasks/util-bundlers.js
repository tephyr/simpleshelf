import {dest} from 'gulp';
const _ = require('lodash'),
    browserify = require('browserify'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
    babelify = require('babelify');


/**
 * Helper function: bundle application code.
 * @param {Object} options {entries, paths, isDebug, vendorLibraries, destinationName, destinationDir}
 **/
export const appBundlerFn = function(options) {
    // console.info('[appBundlerFn]', 'isDebug', options.isDebug, 'entries', options.entries);
    // set up the browserify instance on a task basis
    var transforms = [
        babelify,
        stringify({
            extensions: ['.html'],
            minify: false
        })
    ];

    var b = browserify({
        entries: options.entries,
        debug: options.isDebug, // Enables source maps.
        transform: transforms,
        paths: options.paths    // "Global" paths to include (no-directory imports).
    });

    // Ignore modules in lib.bundle.js.
    _.each(options.vendorLibraries, function(lib) {
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
        .pipe(source(options.destinationName)) // give destination filename
        .pipe(dest(options.destinationDir)); // give destination directory
};

/**
 * Combine all app/code/lib libraries, *in order*, to a lib.bundle.js.
 **/
export const libBundlerFn = function(vendorLibraries, destinationName, destinationDir) {
    // idea courtesy http://stackoverflow.com/a/24876996/562978
    // List all 3rd-party libraries (all of which are node modules), and ``require`` them
    // in this bundle (``lib.bundle.js``).
    // Do **not** list them in the browserify() call, otherwise it will search for a *file*
    // by that name.
    const vendor = browserify();
    _.each(vendorLibraries, function(lib) {
        vendor.require(lib);
    });

    // Return so gulp knows when task finishes.
    return vendor.bundle()
        .pipe(source(destinationName))   // give destination filename
        .pipe(dest(destinationDir)) // give destination directory
        .on('error', gutil.log);
};
