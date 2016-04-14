var gulp = require('gulp'),
    jshint = require('gulp-jshint');

/**
 * Execute JSHint on given source files
 * @param  {Array} sources
 * @param  {String} overrideRcFile
 * @return {Stream}
 */
var analyzejshint = function(sources, overrideRcFile) {
    var jshintrcFile = overrideRcFile || './.jshintrc';
    return gulp
        .src(sources)
        .pipe(jshint(jshintrcFile))
        .pipe(jshint.reporter('jshint-stylish'));
}

module.exports = analyzejshint;
