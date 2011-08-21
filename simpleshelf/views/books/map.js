/**
 * Show all books
 */
function(doc){
    if (doc.type && doc.type == "book"){
        emit(doc.type, doc);
    }
}
