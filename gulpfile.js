var gulp = require('gulp'),
    _ = require('lodash'),
    path = require('path'),
    analyzeJSHint = require('./util/gulp/analyze-jshint');

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
    'allCode': 'app/code/**/*.js',
    'code': ['app/code/**/*.js', '!app/code/test/**/*.js'],
    'testCode': 'app/code/test/**/*.js',
    'templates': 'app/code/**/*.html',
    'ui': path.join(config.get('source'), '_attachments') + '/**/*.html', 
    'couchdbViews': path.join(config.get('source'), 'views') + '/**/*.js', 
    'couchdbSettings': [
        config.get('source') + '/rewrites.json',
        config.get('source') + '/*.js'
    ],
    'sass': 'app/styles/*.scss'
};
// All code that should be seen in dev or prod.
settings.globsAll = _.flattenDeep(_.values(_.omit(settings.globs, ['allCode', 'testCode'])));
// Only code under test.
settings.globsTest = settings.globs.allCode;

// Import external tasks, giving them the settings object.
require("./tasks/bulk-update")(gulp, settings);
require("./tasks/build-docs")(gulp, settings);
require("./tasks/clean-ui-framework")(gulp, settings);
require("./tasks/ui-framework")(gulp, settings);
require("./tasks/ui-local")(gulp, settings);
require("./tasks/bundle-lib")(gulp, settings);
require("./tasks/push")(gulp, settings);
require("./tasks/code-dev")(gulp, settings);
require("./tasks/code")(gulp, settings);
require("./tasks/analyze-jshint")(gulp, settings);
require("./tasks/test-phantom.js")(gulp, settings);
require("./tasks/test-prep.js")(gulp, settings);

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

// Watch files, run analyze tasks.
gulp.task('analyze-watch', function() {
    // When any source code changes, analyze with jshint.
    var watcher = gulp.watch(settings.globs.code);

    watcher.on('change', function(event) {
        analyzeJSHint(event.path);
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

// Watch files, run test tasks.
gulp.task('test-watch', function() {
    // When any test or source code changes, combine/run browserify/run tests.
    var watcher = gulp.watch(settings.globsTest, {debounceDelay: 100}, ['test-phantom']);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});
