var gulp = require('gulp'),
    _ = require('lodash'),
    exec = require('child_process').exec,
    path = require('path'),
    push = require('couchdb-push');

// Check for NODE_ENV; if doesn't exist, use 'personal'.
if (_.isEmpty(process.env.NODE_ENV)) {
    process.env.NODE_ENV = "personal";
}

// Must be loaded *after* NODE_ENV is set.
var config = require('config');

var settings = {
    source: path.resolve(config.get('source')),
    sourceWatch: config.get('sourceWatch'),
    destination: config.get('destination')
};

// Get custom location for erica executable.
if (config.has('ericaBin')) {
    settings.ericaBin = config.get('ericaBin');
} else {
    settings.ericaBin = 'erica';
}

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
 * Push SOURCE to DESTINATION using erica.
 **/
gulp.task('push', function(cb) {
    var options = {
        cwd: path.resolve('.'),
        env: {
            HOME: process.env.HOME,
            PATH: process.env.PATH
        }
    },
    cmd = settings.ericaBin + ' push ' + settings.source + ' ' + settings.destination;

    console.info(cmd);

    // erica push $SOURCE $DESTINATION
    exec(cmd, options, function(error, stdout, stderr) {
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
 * Push SOURCE to DESTINATION using couchdb-push.
 **/
gulp.task('push-simple', function(cb) {
    console.info("Pushing", settings.source, "to", settings.destination);
    push(settings.destination, settings.source, function(err, resp) {
        if (_.isObject(err)) {
            // Handle failure.
            console.error(err);
            return cb(err);
        } else {
            // Handle success.
            console.log(resp);
            return cb();
        }
    });
});

/**
 * Watch for changes, trigger ``push-simple`` task.
 **/
gulp.task('push-simple:watch', function() {
    gulp.watch(settings.sourceWatch, function(event) {
        console.log(path.relative(process.cwd(), event.path)+' ==> '+event.type+', running tasks.');
        gulp.start('push-simple');
    })
})

// Watch files, run dev tasks.
gulp.task('dev-watch', ['push-simple:watch']);
