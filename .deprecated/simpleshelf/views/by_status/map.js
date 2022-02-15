/**
 * Show all books by their reading status
 */
function(doc){
    if (doc.type && doc.type === "book"){
        if (doc.status){
            for (var k in doc.status){
                emit([k, doc.status[k]], doc.title);
            }
        }
    }
}
