import path from 'path';
import del from 'del';

module.exports = function(gulp, settings) {
    /**
     * Clean the output directory.
     */
    gulp.task('_clean:ddoc', function() {
        return del([
            settings.ddocOutput
        ]);
    });

    /**
     * Copy design doc files to output.
     **/
    gulp.task('_copy_ddoc', ['_clean:ddoc'], () => {
        return gulp.src(settings.globs.ddoc)
            .pipe(gulp.dest(settings.ddocOutput));
    });

    /**
     * Take global modules and install them to {ddocOutput/views/lib}.
     */
    gulp.task('_copy_ddoc_modules', ['_copy_ddoc'], () => {
        const moduleDest = path.join(settings.ddocOutput, 'views', 'lib');
        return gulp.src(settings.ddocModules)
            .pipe(gulp.dest(moduleDest));
    });

    /**
     * Run all sub-tasks in order.
     */
    gulp.task('build-ddoc', ['_copy_ddoc_modules']);
};
