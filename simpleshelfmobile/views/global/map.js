/**
 * Show all primary data: books, authors, tags.
 */
function(doc){
    var _ = require('views/lib/underscore');

    if (_.has(doc, "type") && doc.type === "book"){
        // Count all instances of all books.
        emit("_book_instances", 1);

        // Count all instances of all authors.
        if (_.has(doc, "authors") && _.isArray(doc.authors)) {
            _.each(doc.authors, function(author) {
                emit("_author_instances", 1);
            });
        }

        // Count all instances of all tags.
        if (_.has(doc, "tags") && _.isArray(doc.tags)) {
            _.each(doc.tags, function(tag) {
                emit("_tag_instances", 1);
            });
        }
    }
}
