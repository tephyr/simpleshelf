/**
 * Show all authors
 */
function(doc){
    if (doc.author)
        emit(doc.author, doc);
    else
        emit(null, doc);
}
