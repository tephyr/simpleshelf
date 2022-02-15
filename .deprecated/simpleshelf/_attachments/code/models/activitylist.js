/**
 * Collection of Activity records
 */
window.ActivityList = Backbone.Collection.extend({
    model: Activity,
    parse: function(response) {
        var results = [];
        if (response.rows){
            _.each(response.rows, function(element){
                results.push({
                    "date": element.date || null,
                    "action": element.action || null
                });
            });
        }

        return results;
    }
});
