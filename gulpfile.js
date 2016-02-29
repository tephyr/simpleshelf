var gulp = require('gulp'),
    _ = require('lodash'),
    browserify = require('browserify'),
    concat = require('gulp-concat'),
    del = require('del'),
    exec = require('child_process').exec,
    globby = require('globby'),
    gutil = require('gulp-util'),
    merge = require('merge-stream'),
    path = require('path'),
    Promise = require('bluebird'),
    push = require('couchdb-push'),
    sass = require('gulp-sass'),
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
 * Push documents to CouchDB.
 * This involves significant workarounds, since https://github.com/jo/couchdb-compile does not
 * recognize the _docs directory, which is the standard for CouchApps to hold standard documents.
 */
gulp.task('push-docs', function() {
    if (_.has(settings, "_docs")) {
        var pushDoc = Promise.promisify(push);

        // Combine all paths from all keys in _docs.
        var pathGlobs = _.values(settings._docs);

        // Get list of paths from glob, then send each path to pushDoc fn.
        var paths = globby.sync(pathGlobs),
            listOfPromises = _.map(paths, function(path) {
                return pushDoc(settings.destination, path)
                    .then(function(resp) {
                        console.log(resp);
                    })
                    .finally(function() {
                        console.info("Pushed", path);
                    });
            });

        // Done!
        return Promise.all(listOfPromises);

    } else {
        // Nothing to do, end this task succinctly.
        gutil.noop();
    }
});

/**
 * Build documentation.
 */
gulp.task('docs', function(cb) {
    var options = {
        cwd: path.join(path.resolve('.'), 'docs'),
        env: {
            HOME: process.env.HOME,
            PATH: process.env.PATH
        }
    };

    exec('make html', options, function(error, stdout, stderr) {
        console.log(stdout);
        if (error !== null) {
            console.log(`stderr: ${stderr}`);
            console.log(`exec error: ${error}`);
            return cb(error); // return error
        }
        cb(); // finished task
    });
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
 **/
gulp.task('ui-framework', ['clean:ui-framework'], function() {
    var bootstrapCSS = gulp.src(settings.externalUICSSDev)
        .pipe(gulp.dest(settings.styleOutputPath));

    var bootstrapJS = gulp.src(settings.externalUIJSDev)
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
