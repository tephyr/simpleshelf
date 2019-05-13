var gulp = require('gulp'),
    _ = require('lodash'),
    path = require('path'),
    lintSpecific = require('./util/gulp/lint-specific'),
    config = require('config');

var settings = {
    clientSource: path.resolve(config.get('clientSource')),
    docsOutput: config.get('outputDocs'),
    ddocSource: path.resolve(config.get('ddocSource')),
    ddocOutput: config.get('outputDDoc'),
    destination: config.get('destination'),
    codeOutputPath: path.join(config.get('outputWebApp'), 'code'),
    staticOutputPath: config.get('outputWebApp'),
    styleOutputPath: path.join(config.get('outputWebApp'), 'style'),
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
    'allCode': [path.join(settings.clientSource, '/**/*.js')],
    'appCode': [path.join(settings.clientSource, '/**/*.js'), '!' + path.join(settings.clientSource, '/code/test/**/*')],
    'ddocCode': path.join(settings.ddocSource, '**/*.js'),
    'testCode': [path.join(settings.clientSource, '/code/test/**/*.js'), path.join(settings.clientSource, '/code/test/*.html')],
    'templates': [path.join(settings.clientSource, '/code/**/*.html'), '!' + path.join(settings.clientSource, '/code/test/*.html')],
    'ui': path.join(settings.clientSource, '/**/*.html'),
    'directUI': path.join(settings.clientSource, '*.html'),
    'images': path.join(settings.clientSource, 'img', '**/*'),
    'ddoc': path.join(settings.ddocSource, '**/*'),
    'sass': path.join(settings.clientSource, '/style/*.scss')
};

global.settings = settings;

// Import external tasks, giving them the settings object.
//require("./tasks/bulk-update")(gulp, settings);
//require("./tasks/bulk-update-file")(gulp, settings);
import {buildDocs} from "./tasks/build-docs";
import {bundleLib} from "./tasks/bundle-lib";
import {buildDDoc} from "./tasks/build-ddoc";
import {push} from "./tasks/push";
import {code} from "./tasks/code";
import {buildApp} from "./tasks/build-app";
import { lint } from './tasks/lint';

//require("./tasks/test-headless.js")(gulp, settings); // Disabled until node LTS supports async/await AND gulp.
import {uiTest} from "./tasks/ui-test.js";
import {browserSyncInit} from "./tasks/browser-sync-init.js";
import {browserSyncReload} from "./tasks/browser-sync-reload.js";
import * as testInBrowser from "./tasks/test-in-browser";
import {buildForDocker} from "./tasks/build-for-docker.js";

export { buildApp, buildDDoc, buildDocs, buildForDocker, bundleLib, code, lint, push, uiTest };

/**
 * Show settings for this task runner.
 **/
gulp.task('default', function(cb) {
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
    console.info("Typical dev command: `gulp app-watch ddoc-watch test-watch docs-watch`");
    console.info("  (This pushes the current code to CouchDB, builds the UI, then watches for changes.)");

    cb();
});

/**
 * Watch for changes, trigger ``push`` task.
 **/
gulp.task('ddoc-watch', function() {
    gulp.watch(settings.globs.ddoc, function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
        gulp.start('push');
    });
});

// Watch files, build app (front-end only).
gulp.task('app-watch', function() {
    settings.isDebug = true;
    // When any app code changes, combine/run browserify.
    const watchList = _.flattenDeep(_.values(_.pick(settings.globs, ['ui', 'images', 'sass', 'appCode'])));
    const watcher = gulp.watch(watchList, {debounceDelay: 100}, ['build-app']);

    watcher.on('change', function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
});

// Watch files, run analyze tasks.
gulp.task('analyze-watch', function() {
    // When any source code changes, analyze with jshint.
    const watcher = gulp.watch([settings.globs.appCode, settings.globs.ddocCode]);

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

// Watch files, run test tasks.
//gulp.task('test-watch', gulp.series('browser-sync-init', function() {
    // When any test or source code changes, combine/run browserify/run tests.
  //  const watcher = gulp.watch(_.flattenDeep([settings.globs.allCode, settings.globs.testCode]), {debounceDelay: 100},
   //     ['browser-sync-reload'/*, 'test-headless'*/]);

    /*watcher.on('change', function(path, stats) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    }).on('unlink', function(path) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
    });
}));*/
