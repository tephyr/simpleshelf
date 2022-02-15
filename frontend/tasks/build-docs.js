const _ = require('lodash'),
    exec = require('child_process').exec,
    path = require('path');

/**
 * Build documentation.
 */
export const buildDocs = function(cb) {
    const options = {
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
};
