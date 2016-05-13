module.exports = function(gulp, settings) {

    /**
     * Build files locally.
     **/
    gulp.task('build-app', ['build-ddoc', 'bundle-lib', 'code-dev', 'ui-framework', 'ui-local']);
};
