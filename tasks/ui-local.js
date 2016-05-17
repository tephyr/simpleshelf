module.exports = function(gulp, settings) {
    var path = require('path'),
        sass = require('gulp-sass'),
        merge = require('merge-stream');

    /**
     * Build local SASS into CSS, copy any HTML or images.
     **/
    gulp.task('ui-local', function() {
        var uiFiles = gulp.src(settings.globs.directUI)
            .pipe(gulp.dest(path.join(settings.ddocOutput, '_attachments')));

        var imageFiles = gulp.src(settings.globs.images)
            .pipe(gulp.dest(path.join(settings.ddocOutput, '_attachments', 'img')));

        var buildSass = gulp.src(settings.globs.sass)
            .pipe(sass({
                includePaths: [
                    './node_modules/bootstrap/scss'
                ]
            }).on('error', sass.logError))
            .pipe(gulp.dest(settings.styleOutputPath));

        return merge(buildSass, uiFiles, imageFiles);
    });
};
