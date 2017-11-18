/**
 * Show all books (_book), and books by status.
 */
function(doc){
    var utils = require('views/lib/utils');
    if (utils.types.isBook(doc)){
        emit("_book", doc);
        if (doc.status && doc.status.read){
            emit(doc.status.read, doc);
        }
    }
}
