module.exports = function(gulp, settings) {
    var merge = require('merge-stream');

    /**
     * Copy 3rd-party UI framework files to _attachments.
     **/
    gulp.task('ui-framework', gulp.series('clean:ui-framework', function() {
        var bootstrapCSS = gulp.src(settings.externalUICSSDev)
            .pipe(gulp.dest(settings.styleOutputPath));

        var bootstrapJS = gulp.src(settings.externalUIJSDev)
            .pipe(gulp.dest(settings.codeOutputPath));

        return merge(bootstrapCSS, bootstrapJS);
    }));
};
