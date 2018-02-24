module.exports = function(gulp, settings) {
    const lintSpecific = require('../util/gulp/lint-specific');
    /**
     * Execute linter on given source files
     * @return {Stream}
     */
    gulp.task('lint', function () {
        return lintSpecific(settings.globs.appCode);
    });
};
