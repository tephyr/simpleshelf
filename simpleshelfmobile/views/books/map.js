/**
 * Show all books (_book), and books by status.
 */
function(doc){
    if (doc.type && doc.type === "book"){
        emit("_book", doc);
        if (doc.status && doc.status.read){
            emit(doc.status.read, doc);
        }
    }
}
