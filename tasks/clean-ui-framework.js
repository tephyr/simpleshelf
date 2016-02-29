module.exports = function(gulp, settings) {
    var del = require('del');

    /**
     * Delete the ui framework files.
     **/
    gulp.task('clean:ui-framework', function() {
        return del([
            settings.styleOutputPath + "/bootstrap.*",
            settings.codeOutputPath + "/bootstrap.*"
        ]);
    });
};
