module.exports = function(gulp, settings) {
    var mochaPhantomJS = require('gulp-mocha-phantomjs');
     
    gulp.task('test-phantom', ['test-prep', 'bundle-lib'], function () {
        return gulp
            .src('./app/code/test/runner.html')
            .pipe(mochaPhantomJS());
    });
};
