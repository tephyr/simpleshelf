/**
 * Show all authors
 */
function(doc){
    // load libraries
    var _ = require('views/lib/underscore/underscore-min');
    var ctrAuthors = 0;

    if (doc.authors) {
        if (_.isArray(doc.authors)) {
            ctrAuthors = 0;
            _.each(doc.authors, function(author){
                emit(author, {authorPos: ctrAuthors, title: doc.title});
                ctrAuthors++;
            });
        }
    }
}
