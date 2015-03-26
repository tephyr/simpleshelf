"use strict";
/**
 * Get count of database-wide values.
 **/
define([
    "underscore",
    "underscore.string",
    "backbone",
    "app"
], function(_, _s, Backbone, app) {

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

        toJSON: function() {
            var result = this.attributes;
            // Customize the strings.
            _.each(_.pairs(this.attributes), function(pair) {
                result[pair[0] + "_fmt"] = _s.numberFormat(pair[1], 0);
            });
            return result;
        }

    });

    return GlobalCountModel;
});
