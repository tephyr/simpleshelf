const gulp = require('gulp'),
    eslint = require('gulp-eslint');

const fnLint = function(sources) {
    return gulp.src(sources)
        .pipe(eslint())
        .pipe(eslint.format());
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failAfterError last. 
        // .pipe(eslint.failAfterError());
};

module.exports = fnLint;
