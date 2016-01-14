var gulp = require('gulp'),
    _ = require('lodash'),
    browserify = require('browserify'),
    concat = require('gulp-concat'),
    exec = require('child_process').exec,
    gutil = require('gulp-util'),
    path = require('path'),
    push = require('couchdb-push'),
    source = require('vinyl-source-stream'),
    notify = require("gulp-notify"),
    notifier = require("node-notifier");

// Check for NODE_ENV; if doesn't exist, use 'personal'.
if (_.isEmpty(process.env.NODE_ENV)) {
    process.env.NODE_ENV = "personal";
}

// Must be loaded *after* NODE_ENV is set.
var config = require('config');

var settings = {
    source: path.resolve(config.get('source')),
    sourceWatch: config.get('sourceWatch'),
    destination: config.get('destination'),
    codeOutputPath: path.join(config.get('source'), '_attachments', 'code')
};

// Setup globs for watching file changes.
settings.globs = {
    'code': 'app/code/**/*.js',
    'ui': path.join(config.get('source'), '_attachments') + '/**/*.html', 
    'sass': 'app/styles/*.scss'
};

/**
 * Show settings for this task runner.
 **/
gulp.task('default', function() {
    // place code for your default task here
    console.info("Current environment (NODE_ENV)", process.env.NODE_ENV);
    console.info("config.source", settings.source);
    console.info("config.destination", settings.destination);
});

/**
 * Bundle production-ready code.
 **/
gulp.task('code', function () {
    browserify('app/code/main.js')
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('app.bundle.js'))  // give destination filename
        .pipe(gulp.dest(settings.codeOutputPath));
});

/**
 * Bundle debug-ready javascript.
 **/
gulp.task('code-dev', function (cb) {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: 'app/code/main.js',
        debug: true
    });

    // Ignore modules in lib.bundle.js.
    b.exclude('jquery');
    b.exclude('underscore');
    b.exclude('underscore.string');
    b.exclude('handlebars');
    b.exclude('backbone');
    b.exclude('md5');

    // Return so gulp knows when task finishes.
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error')) // Set error handler
        .pipe(source('app.bundle.js')) // give destination filename
        .pipe(gulp.dest(settings.codeOutputPath)); // give destination directory
});

/**
 * Combine all app/code/lib libraries, *in order*, to a lib.bundle.js.
 **/
gulp.task('lib', function() {
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
    vendor.require('jquery');
    vendor.require('underscore');
    vendor.require('underscore.string');
    vendor.require('handlebars');
    vendor.require('backbone');
    vendor.require('md5');

    // Return so gulp knows when task finishes.
    return vendor.bundle()
        .pipe(source('lib.bundle.js'))            // give destination filename
        .pipe(gulp.dest(settings.codeOutputPath)) // give destination directory
        .on('error', gutil.log);
});

/**
 * Push SOURCE to DESTINATION using couchdb-push.
 **/
gulp.task('push', ['lib', 'code-dev'], function(cb) {
    console.info("Pushing", settings.source, "to", settings.destination);
    push(settings.destination, settings.source, function(err, resp) {
        if (_.isObject(err)) {
            // Handle failure.
            console.error(err);
            return cb(err);
        } else {
            // Handle success.
            console.log(resp);
            notifier.notify({title: 'push', message: JSON.stringify(resp, null, ' ')});
            return cb();
        }
    });
});

/**
 * Watch for changes, trigger ``push`` task.
 **/
gulp.task('push:watch', function() {
    gulp.watch([settings.globs.code, settings.globs.ui], function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
        gulp.start('push');
    });
});

// Watch files, run dev tasks.
gulp.task('dev-watch', function() {
    // When any source code changes, combine/run browserify/push to server.
    var watcher = gulp.watch([settings.globs.code, settings.globs.ui], ['push']);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});
