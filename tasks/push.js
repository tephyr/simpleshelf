module.exports = function(gulp, settings) {
    var _ = require('lodash'),
        push = require('couchdb-push'),
        notify = require("gulp-notify"),
        notifier = require("node-notifier");

    /**
     * Push SOURCE to DESTINATION using couchdb-push.
     **/
    gulp.task('push', ['build-app'], function(cb) {
        console.info("Pushing", settings.ddocOutput, "to", settings.destination);
        push(settings.destination, settings.ddocOutput, function(err, resp) {
            if (_.isObject(err)) {
                // Handle failure.
                console.error(err);
                return cb(err);
            } else {
                // Handle success.
                console.log(resp);
                notifier.notify({title: 'push', message: JSON.stringify(resp, null, ' ')});
                return cb();
            }
        });
    });
};
