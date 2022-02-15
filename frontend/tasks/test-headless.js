module.exports = function(gulp, settings) {
    var path = require('path'),
        mochaHeadless = require('gulp-mocha-chrome');
     
    /**
     * Run tests in console using a headless browser.
     */
    gulp.task('test-headless', ['build-tests'], function () {
        return gulp
            .src(path.join(settings.testOutputPath, 'index.html'))
            .pipe(mochaHeadless({reporter: 'dot'}));
    });
};
