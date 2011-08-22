/**
 * In-place edit of existing docs
 * NOTE: user MUST CALL EXPLICITLY
 * @param {Object} doc most recent version in the db
 * @return {Array} [doc, msg]
 */
function(doc, req){
    
    if (doc.type === "book"){
        // TODO: check for changes to log
        // for now, just show that a changelog is possible
        var now = new Date();
        
        if (!doc.changelog){
            doc.changelog = [];
        }
        
        if (doc.changelog){
            doc.changelog.push([now.getTime(), "something happened!"]);
        }
    }

    // TODO: will this blow away all the changes?    
    return [doc, "updated the changelog"];
}
