module.exports = function(gulp, settings) {

    /**
     * Build files locally.
     **/
    gulp.task('build-app', ['build-ddoc', 'bundle-lib', 'code', 'ui-framework', 'ui-local']);
};
