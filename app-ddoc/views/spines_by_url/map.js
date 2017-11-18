/**
 * Show all spines (basic book info).
 */
function(doc){
    var _ = require('views/lib/lodash'),
        utils = require('views/lib/utils'),
        spine;

    if (utils.types.isBook(doc)
        && _.has(doc, "urls") && _.keys(doc.urls).length > 0) {
        // Build spine attributes.
        spine = {
            "title": doc.title,
            "urls": doc.urls
        };

        // Emit by URL key.
        _.each(_.keys(doc.urls), function(key) {
            emit(key, spine);
        }, this);
    }
}
