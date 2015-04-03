"use strict";
/**
 * Model for individual books.
 */
 define([
    "underscore",
    "backbone"
], function(_, Backbone) {
    var Book = Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            'type': 'book',
            'public': true
        },
        url: function(){
            return '_rewrite/data/' + this.get('id');
        }
    });

    return Book;
});
