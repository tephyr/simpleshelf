/**
 * Show all books
 */
function(doc){
    if (doc.type && doc.type == "book"){
        emit(doc.type, doc);
        if (doc.status && doc.status.read){
            emit(doc.status.read, doc);
        }
    }
}
