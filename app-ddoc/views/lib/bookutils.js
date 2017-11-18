/**
 * Get the first letter of the book's title, as lowercase.
 * Returns "?" for null titles, "0" for non-alphabetics.
 **/
function getFirstLetter(doc) {
    var utils = require('views/lib/utils'),
        result;

    if (doc.title === null) {
        result = "?";
    } else {
        firstLetter = doc.title[0].toLowerCase();
        if (utils.strings.isLetter(firstLetter)) {
            result = firstLetter;
        } else {
            // Stuff all non-alphabetics into single category.
            result = "0";
        }
    }
    return result;
}

exports["bookutils"] = {
    "getFirstLetter": getFirstLetter
};
