module.exports = function(gulp, settings) {
    var bundlerFn = require("./test-bundler")(gulp, settings).bundlerFn;

    /**
     * Bundle production-ready code.
     **/
    gulp.task('test-prep', function () {
        return bundlerFn();
    });
};
