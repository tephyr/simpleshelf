module.exports = function(gulp, settings) {
    var path = require('path'),
        sass = require('gulp-sass'),
        merge = require('merge-stream');

    /**
     * Build local SASS into CSS, copy any HTML files.
     **/
    gulp.task('ui-local', function() {
        var uiFiles = gulp.src(settings.globs.directUI)
            .pipe(gulp.dest(path.join(settings.ddocOutput, '_attachments')));

        var buildSass = gulp.src(settings.globs.sass)
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(settings.styleOutputPath));

        return merge(buildSass, uiFiles);
    });
};
