"use strict";
/**
 *  Collection of spines.
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var SpineCollection = Backbone.Collection.extend({
    filterKey: null,
    /**
     * sortBy comparator: return the title, by which BB will sort the collection.
     **/
    comparator: function(spine) {
        return spine.get("title").toLowerCase();
    },

    url: function() {
        var url = "_view/spines";
        if (!_.isNull(this.filterKey)) {
            // Get a subset of the spines, by the given key.
            url = url + '?key="' + this.filterKey + '"';
        }

        return url;
    },
    /**
     * Parse the returned JSON.
     **/
    parse: function(response, options){
        var parsed = [];

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            _.each(response.rows, function(row) {
                parsed.push({
                    id: row.id,
                    firstLetter: row.value.firstLetter,
                    title: row.value.title
                });
            });
        }

        return parsed;
    }
});

export {SpineCollection};
