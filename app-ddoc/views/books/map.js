/**
 * Show all books (_book)
 */
function(doc){
    var utils = require('views/lib/utils');
    if (utils.types.isBook(doc)){
        emit("_book", doc);
    }
}
