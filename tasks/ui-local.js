module.exports = function(gulp, settings) {
    var sass = require('gulp-sass');

    /**
     * Build local SASS into CSS.
     **/
    gulp.task('ui-local', function() {
        gulp.src('app/styles/app.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(settings.styleOutputPath));
    });
};
