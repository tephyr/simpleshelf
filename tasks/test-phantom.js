module.exports = function(gulp, settings) {
    var path = require('path'),
        mochaPhantomJS = require('gulp-mocha-phantomjs');
     
    gulp.task('test-phantom', ['build-tests'], function () {
        return gulp
            .src(path.join(settings.testOutputPath, 'runner.html'))
            .pipe(mochaPhantomJS());
    });
};
