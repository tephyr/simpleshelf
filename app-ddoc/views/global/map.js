/**
 * Show all primary data: books, authors, tags.
 */
function(doc){
    const _ = require('views/lib/lodash'),
        utils = require('views/lib/utils');

    if (utils.types.isBook(doc)){
        // Count all instances of all books.
        emit("_book_instances", 1);

        // Count all instances of all authors.
        if (_.isArray(doc.authors)) {
            doc.authors.forEach(function(author) {
                emit("_author_instances", 1);
            });
        }

        // Count all instances of all tags.
        if (_.isArray(doc.tags)) {
            doc.tags.forEach(function(tag) {
                emit("_tag_instances", 1);
            });
        }
    }
}
