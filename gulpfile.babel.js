const gulp = require('gulp'),
    _ = require('lodash'),
    path = require('path'),
    lintSpecific = require('./util/gulp/lint-specific'),
    config = require('config');

const settings = {
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
import {testInBrowser} from "./tasks/test-in-browser";
import {buildForDocker} from "./tasks/build-for-docker.js";

export { buildApp, buildDDoc, buildDocs, buildForDocker, bundleLib, code, lint, push, testInBrowser };

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
    console.info("Typical dev command: `gulp appWatch ddocWatch testWatch`");
    console.info("  (This pushes the current code to CouchDB, builds the UI, then watches for changes.)");

    cb();
});

/**
 * Watch for changes, trigger ``push`` task.
 **/
export const ddocWatch = function() {
    gulp.watch(settings.globs.ddoc, push);
};

// Watch files, build app (front-end only).
export const appWatch = function() {
    settings.isDebug = true;

    const _logger = function(event, targetPath) {
        if (['add', 'change', 'unlink', 'addDir', 'unlinkDir'].includes(event)) {
            console.log(`${path.relative(process.cwd(), targetPath)} ==> ${event}, building front-end.`);
        }
    };

    // When any app code changes, combine/run browserify.
    const watchList = _.flattenDeep(_.values(_.pick(settings.globs, ['ui', 'images', 'sass', 'appCode'])));
    const watcher = gulp.watch(watchList, gulp.series(buildApp));

    watcher.on('all', _logger);
};

// Watch files, run analyze tasks.
export const analyzeWatch = function() {
    const actionHandlerFn = (path) => {
        lintSpecific(path);
    };

    // When any source code changes, analyze with jshint.
    const watcher = gulp.watch(
        _.flattenDeep([settings.globs.appCode, settings.globs.ddocCode]),
        {events: 'add change'}
    );

    watcher.on('add', actionHandlerFn).on('change', actionHandlerFn);
};

// Watch files, run docs tasks.
/*export const docsWatch = function() {
    if (_.has(settings, "_docs")) {
        // When any doc changes, push to server.
        const watcher = gulp.watch(_.values(settings._docs), gulp.series(bulkUpdate));

        watcher.on('change', function(event) {
            console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', pushing docs.');
        });
    }
};*/

// Watch files, run test tasks.
export const testWatch = gulp.series(browserSyncInit, function() {
    const _logger = function(event, targetPath) {
        //console.log('event', event, 'targetPath', targetPath);
        if (['add', 'change', 'unlink', 'addDir', 'unlinkDir'].includes(event)) {
            console.log(`${path.relative(process.cwd(), targetPath)} ==> ${event}, running tests.`);
        }
    };

    // When any test or source code changes, combine/run browserify/run tests.
    const watcher = gulp.watch(
        _.flattenDeep([settings.globs.allCode, settings.globs.testCode]),
        //{events: 'all'}, // This seems to prevent the chokidar events from firing.
        gulp.series(browserSyncReload) /*'test-headless'*/
    );

    // Use chokidar instance to log events.
    watcher.on('all', _logger);
});
