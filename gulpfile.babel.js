var gulp = require('gulp'),
    _ = require('lodash'),
    path = require('path'),
    lintSpecific = require('./util/gulp/lint-specific'),
    config = require('config');

var settings = {
    clientSource: path.resolve(config.get('clientSource')),
    ddocSource: path.resolve(config.get('ddocSource')),
    ddocOutput: config.get('outputDDoc'),
    destination: config.get('destination'),
    codeOutputPath: path.join(config.get('outputDDoc'), '_attachments', 'code'),
    styleOutputPath: path.join(config.get('outputDDoc'), '_attachments', 'style'),
    isDebug: config.has('debug') ? config.get('debug') : false,
    libraryModules: config.get("libraryModules"),
    extraPaths: config.get("extraPaths"),
    externalUIJSDev: config.get("externalUIJSDev"),
    externalUICSSDev: config.get("externalUICSSDev"),
    externalUICSSTest: config.get("externalUICSSTest"),
    testSource: path.resolve(config.get('testSource')),
    testOutputPath: config.get("outputTest"),
    dynamic: {} // To contain any cross-task variables.
};

if (config.has("_docs")) {
    settings._docs = config.get("_docs");
}

if (config.has('ddocModules')) {
    let modulePaths = _.map(config.get('ddocModules'), (modulePath) => {
        return path.join('node_modules', modulePath);
    });

    settings.ddocModules = modulePaths;
}

// Setup globs for watching file changes.
// Encase any values in arrays that should be joined with other values.
settings.globs = {
    'allCode': ['app/code/**/*.js'],
    'code': ['app/code/**/*.js', '!app/code/test/**/*.js'],
    'ddocCode': path.join(settings.ddocSource, '**/*.js'),
    'testCode': ['app/code/test/**/*.js', 'app/code/test/*.html'],
    'templates': ['app/code/**/*.html', '!app/code/test/*.html'],
    'ui': path.join(settings.clientSource, '/**/*.html'),
    'directUI': path.join(settings.clientSource, '*.html'),
    'images': path.join(settings.clientSource, 'img', '**/*'),
    'ddoc': path.join(settings.ddocSource, '**/*'),
    'sass': 'app/style/*.scss'
};

// All code that should be seen in dev or prod.
// (Get all values in globs **except** allCode, testCode, ddocCode, which are better handled by 'code'.)
settings.globsAll = _.flattenDeep(_.values(_.omit(settings.globs, ['allCode', 'ddocCode', 'testCode'])));
// Only code under test.
settings.globsTest = _.flattenDeep([settings.globs.allCode, settings.globs.testCode]);

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
require("./tasks/build-app")(gulp, settings);
require("./tasks/build-ddoc")(gulp, settings);
require("./tasks/lint")(gulp, settings);
require("./tasks/test-in-browser.js")(gulp, settings);
//require("./tasks/test-headless.js")(gulp, settings); // Disabled until node LTS supports async/await AND gulp.
require("./tasks/bundle-test-lib.js")(gulp, settings);
require("./tasks/ui-test.js")(gulp, settings);
require("./tasks/build-tests.js")(gulp, settings);
require("./tasks/copy-test-lib.js")(gulp, settings);
require("./tasks/browser-sync-init.js")(gulp, settings);
require("./tasks/browser-sync-reload.js")(gulp, settings);

/**
 * Show settings for this task runner.
 **/
gulp.task('default', function() {
    // place code for your default task here
    if (_.isEmpty(process.env.NODE_ENV)) {
        // process.env.NODE_ENV = "personal";
        console.warn("*** No environment set (NODE_ENV is empty); using default. ***");
        console.info("\tUsage (BEFORE launching gulp): export NODE_ENV=somevalue");
        console.info("\tUsage (PER-USE): NODE_ENV=somevalue gulp");
    } else {
        console.info("Current environment (NODE_ENV)", process.env.NODE_ENV);
    }
    console.info("config.clientSource", settings.clientSource);
    console.info("config.ddocSource", settings.ddocSource);

    console.info("Build output (config.outputDDoc)", settings.ddocOutput);
    console.info("Server design doc (config.destination)", settings.destination);
    console.info();
    console.info("Typical dev command: `gulp push dev-watch docs-watch test-watch`");
    console.info("  (This pushes the current code to CouchDB, then watches for changes.)");
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
    var watcher = gulp.watch([settings.globs.code, settings.globs.ddocCode]);

    watcher.on('change', function(event) {
        lintSpecific(event.path);
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
gulp.task('test-watch', ['browser-sync-init'], function() {
    // When any test or source code changes, combine/run browserify/run tests.
    var watcher = gulp.watch(settings.globsTest, {debounceDelay: 100},
        ['browser-sync-reload'/*, 'test-headless'*/]);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});
