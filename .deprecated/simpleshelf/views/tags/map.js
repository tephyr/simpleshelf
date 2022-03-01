/**
 * Index tags
 */
function(doc){
    // May need to expand tag collection to all items
    if (doc.type && doc.type === "book"){
        if (doc.tags && doc.tags.length){
            for (var idx in doc.tags){
                emit(doc.tags[idx], 1);
            }
        }
    }
}
