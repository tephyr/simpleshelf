"use strict";
/**
 *  Collection of book data by first letter of title.
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var BooksByLetterCollection = Backbone.Collection.extend({
    url: function() {
        return "_view/books_by_letter?group=true";
    },

    /**
     * Parse the returned JSON.
     **/
    parse: function(response, options){
        var parsed = [];

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            _.each(response.rows, function(row) {
                parsed.push({id: row.key, value: row.value});
            });
        }

        return parsed;
    }
});

module.exports = BooksByLetterCollection;
