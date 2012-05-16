/**
 * ByYearSpineList: SpineList extended for holding Spines by year
 */
 window.ByYearSpineList = window.SpineList.extend({
    model: Spine, // same

    initialize: function(models, options) {
    	// Backbone.Model.prototype.set.call(this, attributes, options);
    	window.SpineList.prototype.initialize.call(this, models, options);
    },

    url: function(){
	    return '/simpleshelf/_design/simpleshelf/_view/by_year'
	},

    parse: function(response){
        var results = [], row, values;
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                row = response.rows[x];
                values = {
                	'_rev': row.value._rev,
                	'id': row.id,
                	'latestDateFinished': row.value.latestDateFinished,
                	'title': row.value.title,
                	'year': row.key
                };
                results.push(values);
            }
       }
       return results;
    }

});
