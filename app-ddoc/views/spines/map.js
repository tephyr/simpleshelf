/**
 * Show all spines (basic book info).
 */
function(doc){
    var _ = require('views/lib/underscore'),
        bookUtils = require('views/lib/bookutils').bookutils,
        firstLetter,
        spine;

    if (_.has(doc, "type") && doc.type === "book") {
        firstLetter = bookUtils.getFirstLetter(doc);

        // Build spine attributes.
        spine = {
            "firstLetter": firstLetter,
            "title": doc.title
        };

        // emit by first letter & id.
        emit(firstLetter, spine);
        // emit(doc._id, spine);
    }
}
