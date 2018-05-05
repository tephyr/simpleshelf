import _ from 'lodash';
import del from 'del';

/**
 * Copy docs to staging directory.
 */
module.exports = function(gulp, settings) {
    gulp.task('_clean-docs', function(cb) {
        return del(settings.docsOutput);
    });

    gulp.task('copy-docs', ['_clean-docs'], function() {
        let docsGlobs = [];

        if (_.has(settings, '_docs')) {
            // Combine all values for each key.
            docsGlobs = _.values(settings._docs);
        }

        return gulp.src(docsGlobs)
            .pipe(gulp.dest(settings.docsOutput));
    });
};
