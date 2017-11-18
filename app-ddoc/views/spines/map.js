/**
 * Show all spines (basic book info).
 */
function(doc){
    var utils = require('views/lib/utils'),
        bookUtils = require('views/lib/bookutils').bookutils,
        firstLetter,
        spine;

    if (utils.types.isBook(doc)) {
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
