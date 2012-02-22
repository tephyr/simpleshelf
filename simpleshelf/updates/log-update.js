/**
 * Update log for book records
 * NOTE: client MUST CALL EXPLICITLY
 * @param {Object} doc most recent version in the db
 * @param {Object} req user request
 * @return {Array} [doc, msg]
 * 
 * The point: if doc is null, then req is sending a new doc; if doc is not null, then a match was found,
 * and req is **intended** to **update** the doc.
 * 
 * Client must call explicitly because (in part) the revision is not required: this function can update
 * a doc just given its id.
 * 
 * This module's code should **only** compare specific fields and update as necessary; building a new
 * document here, instead of in a validation function, will only cause problems.
 */
function(doc, req){
    if (doc == null){
        doc = {'type': 'test'};
    }
    if (doc.type === "book"){
        var now = new Date();
        
        var resultDoc = req;
        
        if (!resultDoc.activity){
            resultDoc.activity = [];
        }
        // new book?
        if (!doc.id) {
            resultDoc.activity.push({'date here!': 'book.added'});
        }
        
        // started?
        statusOriginal = _.extend({'read': null, 'ownership': null}, doc.status || {});
        statusNew = _.extend({'read': null, 'ownership': null}, req.status || {});
        if (statusOriginal.read && (statusOriginal.read != statusNew.read)){
            if (statusNew.read == 'to.read'){
                resultDoc.activity.push({'date': now.getTime(), 'action': 'book.read.queued'});
            }
        }
            
        resultDoc.activity.push({'date': now.getTime(), 'action': "something happened!"});
        return [resultDoc, "updated the activity log for book"];
    } else if (doc.type === 'test'){
        // load underscore-min.js
        var _ = require('libs/underscore/underscore-min');
        // ensure .activity exists
        if (!doc.activity){
            doc.activity = [];
        }
        // test if underscore is available by actually using it
        var msg = 'handled test doc; previous activity count was ' + _.size(doc.activity);
        doc.activity.push({'date': new Date().getTime(), 'action': msg});
        
        return [doc, "log-update: handled a test record"];
    }
}
