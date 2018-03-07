"use strict";
/**
 *  All tags.
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var TagCollection = Backbone.Collection.extend({

    url: function() {
        return "view/tags?group=true";
    },

    /**
     * Parse the returned JSON.
     **/
    parse: function(response, options){
        var parsed = [];

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            _.each(response.rows, function(row) {
                parsed.push({
                    id: row.key,
                    count: row.value
                });
            });
        }

        return parsed;
    }
});

export {TagCollection};
