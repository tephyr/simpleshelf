module.exports = function(gulp, settings) {
    var _ = require('lodash'),
        exec = require('child_process').exec,
        path = require('path'),
        analyzeJSHint = require('../util/gulp/analyze-jshint');

    /**
     * Execute JSHint on given source files
     * @return {Stream}
     */
    gulp.task('analyze-jshint', function () {
        return analyzeJSHint(settings.globs.code);
    });
};
