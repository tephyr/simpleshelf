module.exports = function(gulp, settings) {
    var _ = require('lodash'),
        globby = require('globby'),
        Promise = require('bluebird'),
        push = require('couchdb-push');

    /**
     * Push documents to CouchDB.
     * This involves significant workarounds, since https://github.com/jo/couchdb-compile does not
     * recognize the _docs directory, which is the standard for CouchApps to hold standard documents.
     */
    gulp.task('push-docs', function() {
        if (_.has(settings, "_docs")) {
            var pushDoc = Promise.promisify(push);

            // Combine all paths from all keys in _docs.
            var pathGlobs = _.values(settings._docs);

            // Get list of paths from glob, then send each path to pushDoc fn.
            var paths = globby.sync(pathGlobs),
                listOfPromises = _.map(paths, function(path) {
                    return pushDoc(settings.destination, path)
                        .then(function(resp) {
                            console.log(resp);
                        })
                        .finally(function() {
                            console.info("Pushed", path);
                        });
                });

            // Done!
            return Promise.all(listOfPromises);

        } else {
            // Nothing to do, end this task succinctly.
            gutil.noop();
        }
    });
};
