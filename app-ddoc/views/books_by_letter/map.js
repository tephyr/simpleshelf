/**
 * Show books by first letter of title.
 */
function(doc){
    var utils = require('views/lib/utils'),
        bookUtils = require('views/lib/bookutils').bookutils;

    if (utils.types.isBook(doc)){
        // "?" for null, "0" for non-alphabetic, lowercase for alphabetic.
        emit(bookUtils.getFirstLetter(doc), 1);
    }
};
