var gulp = require('gulp'),
    _ = require('lodash'),
    browserify = require('browserify'),
    concat = require('gulp-concat'),
    del = require('del'),
    exec = require('child_process').exec,
    gutil = require('gulp-util'),
    merge = require('merge-stream'),
    path = require('path'),
    push = require('couchdb-push'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
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
    codeOutputPath: path.join(config.get('source'), '_attachments', 'code'),
    styleOutputPath: path.join(config.get('source'), '_attachments', 'style'),
    isDebug: false,
    libraryModules: config.get("libraryModules")
};

// Setup globs for watching file changes.
settings.globs = {
    'code': 'app/code/**/*.js',
    'templates': 'app/code/**/*.html',
    'ui': path.join(config.get('source'), '_attachments') + '/**/*.html', 
    'sass': 'app/styles/*.scss'
};
settings.globsAll = _.values(settings.globs);

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
    _.each(settings.libraryModules, function(lib) {
        vendor.require(lib);
    })

    // Return so gulp knows when task finishes.
    return vendor.bundle()
        .pipe(source('lib.bundle.js'))            // give destination filename
        .pipe(gulp.dest(settings.codeOutputPath)) // give destination directory
        .on('error', gutil.log);
});

/**
 * Copy 3rd-party UI framework files to _attachments.
 * NOTE: set useDevFiles to settings.isDebug when ready to ship production code.
 **/
gulp.task('ui-framework', ['clean:ui-framework'], function() {
    var useDevFiles = true,
        pathParent = 'node_modules/bootstrap/dist/',
        cssGlob = pathParent + 'css/bootstrap' + (useDevFiles ? ".css*" : ".min.*"),
        jsGlob = pathParent + 'js/bootstrap' + (useDevFiles ? ".js" : ".min.js");

    var bootstrapCSS = gulp.src(cssGlob)
        .pipe(gulp.dest(settings.styleOutputPath));

    var bootstrapJS = gulp.src(jsGlob)
        .pipe(gulp.dest(settings.codeOutputPath));

    return merge(bootstrapCSS, bootstrapJS);
});

/**
 * Delete the ui framework files.
 **/
gulp.task('clean:ui-framework', function() {
    return del([
        settings.styleOutputPath + "/bootstrap.*",
        settings.codeOutputPath + "/bootstrap.*"
    ]);
});

/**
 * Build local SASS into CSS.
 **/
gulp.task('ui-local', function() {
    gulp.src('app/styles/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(settings.styleOutputPath));
});

/**
 * Push SOURCE to DESTINATION using couchdb-push.
 **/
gulp.task('push', ['lib', 'code-dev', 'ui-framework', 'ui-local'], function(cb) {
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

// Watch files, run production tasks.
gulp.task('prod-watch', function() {
    settings.isDebug = false;
    // When any source code changes, combine/run browserify/push to server.
    var watcher = gulp.watch(settings.globsAll, ['push']);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});
