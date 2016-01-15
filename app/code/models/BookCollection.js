"use strict";
/**
 *  Collection of books.
 **/
var _ = require("underscore"),
    Backbone = require("backbone"),
    Book = require("./Book.js");

var BookCollection = Backbone.Collection.extend({
    model: Book,
    url: function() {
        // TODO: this filters by status.read===reading; add option to get all books & different statuses.
        return "_view/books?key=%22reading%22&reduce=false";
    },
    /**
     * Parse the returned JSON.
     **/
    parse: function(response, options){
        var parsed = [];

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            _.each(response.rows, function(row) {
                parsed.push(row.value);
            });
        }

        return parsed;
    }
});

module.exports = BookCollection;
