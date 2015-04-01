/**
 * Show books by first letter of title.
 */
function(doc){
    var _ = require('views/lib/underscore'),
        bookUtils = require('views/lib/bookutils').bookutils;

    if (_.has(doc, "type") && doc.type === "book"){
        // "?" for null, "0" for non-alphabetic, lowercase for alphabetic.
        emit(bookUtils.getFirstLetter(doc), 1);
    }
};
