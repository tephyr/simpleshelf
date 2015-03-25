"use strict";
/**
 * Get count of database-wide values.
 **/
define([
    "underscore",
    "backbone",
    "app"
], function(_, Backbone, app) {

    var GlobalCountModel = Backbone.Model.extend({
        url: function() {
            return "_view/global?group=true";
        },

        /**
         * Parse the *grouped* values.
         **/
        parse: function(response, options){
            var results = {};

            if (_.has(response, "rows") && _.isArray(response.rows)) {
                _.each(response.rows, function(row) {
                    results[row.key] = row.value;
                });
            }

            return results;
        },

    });

    return GlobalCountModel;
});
