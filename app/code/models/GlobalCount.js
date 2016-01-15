"use strict";
/**
 * Get count of database-wide values.
 **/
var _ = require("underscore"),
    _s = require("underscore.string"),
    Backbone = require("backbone");

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
    },

    /* Custom functions. */
    /**
     * Format a field simply (commas after thousands).
     */
    formatSimply: function(fieldName) {
        return _s.numberFormat(this.get(fieldName), 0);
    }

});

module.exports = GlobalCountModel;
