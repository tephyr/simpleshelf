/**
 * Show all docs, by type
 */
function(doc) {
    if (doc.title)
        emit(doc.type, {"title": doc.title, "_rev": doc._rev});
    else
        emit(doc.type, null);
};
