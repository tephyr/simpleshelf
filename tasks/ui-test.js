module.exports = function(gulp, settings) {
    var merge = require('merge-stream'),
        path = require('path');

    /**
     * Copy HTML & CSS files to test output.
     **/
    gulp.task('ui-test', function() {
        var mochaCSS = gulp.src(settings.externalUICSSTest)
            .pipe(gulp.dest(settings.testOutputPath));

        var testUI = gulp.src(path.join(settings.testSource, '*.html'))
            .pipe(gulp.dest(settings.testOutputPath));

        return merge(mochaCSS, testUI);
    });
};
