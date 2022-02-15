/**
 * Index books by year last finished
 */
function(doc){
    // load libraries
    var _ = require('views/lib/underscore/underscore-min');
    var moment = require('views/lib/moment/moment');
	// get all books
    if (doc.type && doc.type === "book"){
    	// check for activities
        if (doc.activities && doc.activities.length){
        	// find *last* book.read.finished entry
            var latestDateFinished = null;
            _.each(doc.activities, function(element, idx){
            	if (element.action && element.action == 'book.read.finished'){
            		if (latestDateFinished == null){
            			latestDateFinished = moment(element.date);
            		} else {
            			// check for latest
            			var nextDate = moment(element.date);
            			if (nextDate > latestDateFinished){
            				latestDateFinished = moment(nextDate);
            			}
            		}
            	}
            });
            emit(latestDateFinished.format("YYYY"), {
            	 "title": doc.title,
            	 "_rev": doc._rev,
            	 "latestDateFinished": latestDateFinished.format("YYYY-MM-DD")
            	}
            );
        }
    }
};
