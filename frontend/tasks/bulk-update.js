module.exports = function(gulp, settings) {
    var _ = require('lodash'),
        fs = require('fs'),
        globby = require('globby'),
        path = require('path'),
        unirest = require('unirest');

    // Combine all documents into single array, under {"docs": []}.
    gulp.task("bulk-update", function() {
        var _logHeader = "[bulk-update]",
            debug = false,
            pathGlobs = _.values(settings._docs),
            bulkDocs = {"docs": []},
            paths = globby.sync(pathGlobs);

        // Generate list of paths to documents that must be uploaded.
        _.each(paths, function(jsonPath) {
            bulkDocs.docs.push(JSON.parse(fs.readFileSync(path.join(process.cwd(), jsonPath), 'utf8')));
        });

        if (debug) {
            console.info(_logHeader, bulkDocs);
        }

        // Get docs matching keys of docs to add,
        // because they need to include the _rev value to force an update.
        var bulkKeys = {
            "keys": _.map(bulkDocs.docs, function(doc) {
                return doc._id;
            })
        };

        if (debug) {
            console.info(_logHeader, bulkKeys.keys);
        }

        /**
         * Get all docs for the given keys (POST _all_docs).
         * @return {Promise}
         */
        var allDocsAsync = function() {
            return new Promise(function(resolve, reject) {
                unirest.post(settings.destination + "/_all_docs")
                    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                    .send(bulkKeys)
                    .end(function(response) {
                        console.log(_logHeader, "allDocsAsync OK"); //, JSON.stringify(bulkKeys));
                        resolve(response);
                    });
            });
        };

        /**
         * Update bulkDocs with _rev values.
         */
        var revUpdate = function(response) {
            var revsForDocs = {};

            // Put all rev values into object.
            _.each(response.body.rows, function(doc) {
                if (debug) {
                    console.info(_logHeader, "[revUpdate]", doc);
                }
                // Make sure doc.value has "rev". If a new doc is sent, it won't have a "value" key.
                if (_.has(doc, "value") && _.has(doc.value, "rev")) {
                    revsForDocs[doc.key] = doc.value.rev;
                }
            });

            // Iterate through bulkDocs, update doc with rev.
            _.each(bulkDocs.docs, function(doc, idx) {
                if (_.has(revsForDocs, doc._id)) {
                    bulkDocs.docs[idx]._rev = revsForDocs[doc._id];
                }
            });

            console.log(_logHeader, "revUpdate OK");//, JSON.stringify(bulkDocs));
            return bulkDocs;
        };

        /**
         * Add or update docs
         * @param  {Object} bulkDocs CouchDB-ready payload for _bulk_docs endpoint
         * @return {Promise}
         */
        var postBulkDocsAsync = function(bulkDocs) {
            return new Promise(function(resolve, reject) {
                // POST to _bulk_docs endpoint.
                if (debug) {
                    console.info(_logHeader, "[postBulkDocsAsync] pre", JSON.stringify(bulkDocs));
                }

                unirest.post(settings.destination + "/_bulk_docs")
                    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                    .send(bulkDocs)
                    .end(function (response) {
                        // TODO: check that each doc has "ok": true response.
                        console.log(_logHeader, "postBulkDocsAsync OK (status==" + response.status + ")",
                            response.body);
                        resolve(response);
                    });
                });
        };

        // Run the promises in order.
        return allDocsAsync()
            .then(revUpdate)
            .then(postBulkDocsAsync);
    });
};
