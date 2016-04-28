module.exports = function(gulp, settings) {
    var mochaPhantomJS = require('gulp-mocha-phantomjs');
     
    gulp.task('test-phantom', ['test-prep'], function () {
        return gulp
            .src('./app/code/test/runner.html')
            .pipe(mochaPhantomJS());
    });
};
