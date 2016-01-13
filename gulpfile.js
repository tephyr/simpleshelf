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
gulp.task('code-dev', function () {
    browserify('app/code/main.js', {debug: true})
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('app.bundle.js'))  // give destination filename
        .pipe(gulp.dest(settings.codeOutputPath));
});

/**
 * Combine all app/code/lib libraries, *in order*, to a lib.bundle.js.
 **/
gulp.task('lib', function() {
    var libsInOrder = [
        'jquery.js',
        'underscore.js',
        'underscore.string.js',
        'handlebars.js',
        'backbone.js',
        'md5.js',
        // NOTE: using the following will require the jquery.couch.js file, typically
        // available under /_utils/script/jquery.couch.js.
        // 'jquery.couch.app.js',
        // 'jquery.couch.app.util.js',
        // 'jquery.couchForm.js',
        // 'jquery.mustache.js',
        // 'jquery.couchLogin.js',
        // 'jquery.couchProfile.js',
    ];

    // Convert to relative paths.
    var sources = _.map(libsInOrder, function(library) {
        return 'app/lib/' + library;
    });

    return gulp.src(sources)
        .pipe(concat('lib.bundle.js'))
        .pipe(gulp.dest(settings.codeOutputPath));
});

/**
 * Push SOURCE to DESTINATION using couchdb-push.
 **/
gulp.task('push', function(cb) {
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
    gulp.watch(settings.sourceWatch, function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
        gulp.start('push');
    });
});

// Watch files, run dev tasks.
gulp.task('dev-watch', ['push:watch']);
