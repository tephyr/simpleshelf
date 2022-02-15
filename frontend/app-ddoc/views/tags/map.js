/**
 * Index tags.
 */
function(doc){
    const utils = require('views/lib/utils');

    if (utils.types.isBook(doc)) {
        if (doc.tags && doc.tags.length) {
            doc.tags.forEach(function(tag) {
                emit(tag, 1);
            });
        }
    }
}
