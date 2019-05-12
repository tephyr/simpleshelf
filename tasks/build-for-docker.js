/**
 * build-for-docker: prep everything in ./output
 */
module.exports = function(gulp, settings) {
    gulp.task('build-for-docker', gulp.series('build-app', 'copy-docs', 'build-ddoc'));
};
