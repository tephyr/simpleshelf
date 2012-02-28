/**
 * Delete a document with a blank id
 * Via http://stackoverflow.com/questions/7604557/how-do-you-delete-a-couchdb-document-with-an-empty-document-id/7605456#7605456
 * Usage:
 * $ rev="1-2f11e026763c10730d8b19ba5dce7565"
 * $ curl -XPOST localhost:5984/db/_design/example/_update/del_blank?rev=$rev
 */
function(doc, req) {
    var doc = {_id:'', _rev:req.query.rev, _deleted:true};
    return [doc, 'Trying to delete nastydoc@'+doc._rev];
}
