/**
 * build-for-docker: prep everything in ./output
 */
module.exports = function(gulp, settings) {
    gulp.task('build-for-docker', ['build-app', 'copy-docs', 'build-ddoc']);
};
