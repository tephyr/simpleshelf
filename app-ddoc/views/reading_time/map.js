/**
 * Show reading time for books that have a start & finish.
 */
function(doc){
    var _ = require('views/lib/lodash'),
        utils = require('views/lib/utils'),
        moment = require('views/lib/moment'),
        sortedActivities,
        start = null,
        hasTerm = false,
        result = 0;

    // Find books.
    if (utils.types.isBook(doc)) {
        // Find books with activities.
        if (doc.activities && doc.activities.length > 0) {
            // Get sorted activities.
            sortedActivities = _.sortBy(doc.activities, function(activity) {
                return activity.date;
            });

            // Find pairs of started/finished activities.
            _.each(sortedActivities, function(activity) {
                if (activity.action && activity.action === "book.read.started") {
                    start = moment(activity.date);
                } else if (activity.action && activity.action === "book.read.finished") {
                    if (!_.isNull(start)) {
                        hasTerm = true;
                        result += moment(activity.date).diff(start, 'days');

                        // Reset
                        start = null;
                    }
                }
            });

            if (hasTerm) {
                emit(null, result);
            }
        }
    }
}
