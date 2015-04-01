"use strict";
/**
 *  Collection of spines.
 **/
 define([
    "underscore",
    "backbone"
], function(_, Backbone) {

    var SpineCollection = Backbone.Collection.extend({
        filterKey: null,
        url: function() {
            var url = "_view/spines";
            if (!_.isNull(this.filterKey)) {
                // Get a subset of the spines, by the given key.
                url = url + "?key=\"" + this.filterKey + \"";
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
                        firstLetter: row.values.firstLetter,
                        title: row.values.title
                    });
                });
            }

            return parsed;
        }
    });

    return SpineCollection;
});
