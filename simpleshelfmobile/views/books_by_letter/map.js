/**
 * Show books by first letter of title.
 */
function(doc){
    var _ = require('views/lib/underscore'),
        utils = require('views/lib/utils'),
        firstLetter = null;

    if (_.has(doc, "type") && doc.type === "book"){
        if (_.isNull(doc.title)) {
            emit("?", 1);
        } else {
            firstLetter = doc.title[0].toLowerCase();
            if (utils.strings.isLetter(firstLetter)) {
                emit(firstLetter, 1);
            } else {
                // Stuff all non-alphabetics into single category.
                emit("0", 1);
            }
        }
    }
};
