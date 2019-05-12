module.exports = function(gulp, settings) {

    /**
     * Build files locally.
     **/
    gulp.task('build-app', gulp.series('bundle-lib', 'code', 'ui-framework', 'ui-local'));
};
