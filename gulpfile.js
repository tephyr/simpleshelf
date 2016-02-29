var gulp = require('gulp'),
    _ = require('lodash'),
    browserify = require('browserify'),
    concat = require('gulp-concat'),
    globby = require('globby'),
    gutil = require('gulp-util'),
    path = require('path'),
    Promise = require('bluebird'),
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
    notify = require("gulp-notify"),
    notifier = require("node-notifier");

// Check for NODE_ENV; if doesn't exist, use 'personal'.
// Usage (BEFORE launching gulp): export NODE_ENV=somevalue
if (_.isEmpty(process.env.NODE_ENV)) {
    process.env.NODE_ENV = "personal";
}

// Must be loaded *after* NODE_ENV is set.
var config = require('config');

var settings = {
    source: path.resolve(config.get('source')),
    sourceWatch: config.get('sourceWatch'),
    destination: config.get('destination'),
    codeOutputPath: path.join(config.get('source'), '_attachments', 'code'),
    styleOutputPath: path.join(config.get('source'), '_attachments', 'style'),
    isDebug: false,
    libraryModules: config.get("libraryModules"),
    externalUIJSDev: config.get("externalUIJSDev"),
    externalUICSSDev: config.get("externalUICSSDev")
};

if (config.has("_docs")) {
    settings._docs = config.get("_docs");
}

// Setup globs for watching file changes.
settings.globs = {
    'code': 'app/code/**/*.js',
    'templates': 'app/code/**/*.html',
    'ui': path.join(config.get('source'), '_attachments') + '/**/*.html', 
    'couchdbViews': path.join(config.get('source'), 'views') + '/**/*.js', 
    'couchdbSettings': [
        config.get('source') + '/rewrites.json',
        config.get('source') + '/*.js'
    ],
    'sass': 'app/styles/*.scss'
};
settings.globsAll = _.flattenDeep(_.values(settings.globs));

// Import external tasks, giving them the settings object.
require("./tasks/bulk-update")(gulp, settings);
require("./tasks/build-docs")(gulp, settings);
require("./tasks/clean-ui-framework")(gulp, settings);
require("./tasks/ui-framework")(gulp, settings);
require("./tasks/ui-local")(gulp, settings);
require("./tasks/bundle-lib")(gulp, settings);
require("./tasks/push")(gulp, settings);

/**
 * Helper function: bundle application code.
 **/
var appBundlerFn = function(isDebug) {
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
};

/**
 * Show settings for this task runner.
 **/
gulp.task('default', function() {
    // place code for your default task here
    console.info("Current environment (NODE_ENV)", process.env.NODE_ENV);
    console.info("config.source", settings.source);
    console.info("config.destination", settings.destination);
    console.info("Typical dev command: `gulp dev-watch docs-watch`");
});

/**
 * Bundle production-ready code.
 **/
gulp.task('code', function () {
    return appBundlerFn(false);
});

/**
 * Bundle debug-ready javascript.
 **/
gulp.task('code-dev', function (cb) {
    return appBundlerFn(settings.isDebug);
});

/**
 * Watch for changes, trigger ``push`` task.
 **/
gulp.task('push:watch', function() {
    gulp.watch(settings.globsAll, function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
        gulp.start('push');
    });
});

// Watch files, run dev tasks.
gulp.task('dev-watch', function() {
    settings.isDebug = true;
    // When any source code changes, combine/run browserify/push to server.
    var watcher = gulp.watch(settings.globsAll, {debounceDelay: 100}, ['push']);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});

// Watch files, run docs tasks.
gulp.task('docs-watch', function() {
    if (_.has(settings, "_docs")) {
        // When any doc changes, push to server.
        var watcher = gulp.watch(_.values(settings._docs), {debounceDelay: 100}, ['bulk-update']);

        watcher.on('change', function(event) {
            console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', pushing docs.');
        });
    }
});

// Watch files, run production tasks.
gulp.task('prod-watch', function() {
    settings.isDebug = false;
    // When any source code changes, combine/run browserify/push to server.
    var watcher = gulp.watch(settings.globsAll, ['push']);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});
