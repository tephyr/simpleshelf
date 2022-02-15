/**
 * ByYearSpineList: SpineList extended for holding Spines by year
 */
 window.ByYearSpineList = window.SpineList.extend({
    model: Spine, // same

    initialize: function(models, options) {
    	// Backbone.Model.prototype.set.call(this, attributes, options);
    	window.SpineList.prototype.initialize.call(this, models, options);
        // additional bindings
        _.bindAll(this, 'getAvailableYears', 'getSpinesByYear');
        this.options = options;
    },

    url: function(){
        return '_view/by_year'
	},

    comparator: function(model) {
        return model.get('latestDateFinished');
    },

    parse: function(response){
        var results = [], row, values, year;
        if (response.rows){
            for (var x = 0; x < response.rows.length; x++){
                row = response.rows[x];
                year = parseInt(row.key);
                if (_.isNaN(year)){
                    year = null;
                }
                values = {
                	'_rev': row.value._rev,
                	'id': row.id,
                	'latestDateFinished': row.value.latestDateFinished,
                	'title': row.value.title,
                    'year': year
                };
                results.push(values);
            }
       }
       return results;
    },

    /**
     * Return sorted list of years with data
     */
    getAvailableYears: function(){
        var allYears = this.map(function(model){
            return model.get('year');
        });
        // sort, make uniq
        allYears.sort();
        return _.uniq(allYears, true);
    },

    /**
     * Return list of spines within given year
     */
    getSpinesByYear: function(year){
        return this.filter(function(model){
            if (model.get('year') == year) {
                return true;
            }
        });
    },

    _goto: function(offset){
        var currentSpineIdx = null;
        var me = this;
        this.each(function(spine, index){
            if (me._currentSpine == spine.id){
                currentSpineIdx = index;
                return;
            }
        });

        var gotoIndex = currentSpineIdx + offset;
        if (currentSpineIdx !== null){
            if (gotoIndex == -1){
                // previous wrap-around
                gotoIndex = this.length - 1;
            }
            else if (this.length == gotoIndex){
                // next wrap-around
                gotoIndex = 0;
            }
        } else {
            return null;
        }

        var spineId = this.at(gotoIndex).id;
        this._currentSpine = spineId;
        console.log('Moving to index', gotoIndex, 'spineId', spineId, 'title', this.at(gotoIndex).get('title'));
        this.trigger('spinelist:move', spineId);
    }
});
