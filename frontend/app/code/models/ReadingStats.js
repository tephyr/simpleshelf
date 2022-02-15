"use strict";
/**
 * Get current reading stats.
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var ReadingStatsModel = Backbone.Model.extend({
    url: function() {
        return "view/reading_time";
    },

    /**
     * Parse the response.
     **/
    parse: function(response, options){
        var results = {};

        if (_.has(response, "rows") && _.isArray(response.rows) && response.rows.length === 1) {
            results = response.rows[0].value;
        }

        return results;
    }
});

export {ReadingStatsModel};
