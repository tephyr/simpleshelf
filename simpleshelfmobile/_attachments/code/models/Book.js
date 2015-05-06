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
            var urlPrefix = '_rewrite/data/';
            if (this.isNew()) {
                // Do not include non-existent server ID.
                return urlPrefix;
            } else {
                return urlPrefix + this.get(this.idAttribute);
            }
        },

        /**
         * Because CouchDB returns id & rev for some calls, and _id and _rev for others, 
         * handle those special cases here.
         **/
        parse: function(response, options) {
            if (_.has(response, "id") && _.has(response, "rev")) {
                response["_id"] = response["id"];
                response["_rev"] = response["rev"];
                delete response["id"];
                delete response["rev"];
                // Also get rid of "ok" key.
                if (_.has(response, "ok")) {
                    delete response["ok"];
                }
            }
            return response;
        }
    });

    return Book;
});
