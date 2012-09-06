/**
 * Books without read status
 */
function(doc){
    // load libraries
    var _ = require('views/lib/underscore/underscore-min');
    _.str = require('views/lib/underscore/underscore.string.min');
    // get books without any status, or any value in the read status
    if (doc.type && doc.type === "book"){
        if (!_.has(doc, 'status')){
            emit(null, doc);
        }
        else if (!_.has(doc.status, 'read')){
            emit(null, doc);
        } else {
            var statusRead = _.str.trim(doc.status.read);
            if (statusRead.length == 0) {
                emit(null, doc);
            }
        }
    }
};
