module.exports = function(gulp, settings) {
    var path = require('path'),
        mochaPhantomJS = require('gulp-mocha-phantomjs');
     
    /**
     * Run tests in console using PhantomJS.
     */
    gulp.task('test-phantom', ['build-tests'], function () {
        return gulp
            .src(path.join(settings.testOutputPath, 'index.html'))
            .pipe(mochaPhantomJS({reporter: 'dot'}));
    });
};
