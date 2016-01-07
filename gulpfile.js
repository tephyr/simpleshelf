var gulp = require('gulp'),
    _ = require('lodash'),
    exec = require('child_process').exec,
    path = require('path');

// Check for NODE_ENV; if doesn't exist, use 'personal'.
if (_.isEmpty(process.env.NODE_ENV)) {
    process.env.NODE_ENV = "personal";
}

// Must be loaded *after* NODE_ENV is set.
var config = require('config');

var settings = {
    source: path.resolve(config.get('source')),
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
