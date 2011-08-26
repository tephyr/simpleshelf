/**
 * Show all docs, by type
 */
function(doc) {
    if (doc.title)
        emit(doc.type, doc.title);
    else
        emit(doc.type, null);
};
