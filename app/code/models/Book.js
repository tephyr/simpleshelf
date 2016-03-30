"use strict";
/**
 * Model for individual books.
 */
var _ = require("underscore"),
    _s = require("underscore.string"),
    Backbone = require("backbone");

var Book = Backbone.Model.extend({
    _logHeader: "[Book]",
    idAttribute: "_id",
    defaults: {
        'type': 'book',
        'public': true
    },

    initialize: function(attributes, options) {
        if (_.isObject(attributes) && _.has(attributes, "configuration")) {
            this._configuration = attributes.configuration;
        }
    },

    url: function(){
        var urlPrefix = 'data/';
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

        // Order the activities by date.
        if (_.has(response, "activities")) {
            response.activities = _.sortBy(response.activities, function(activity) {
                return activity.date;
            });
        }
        return response;
    },

    /**
     * Validate model.
     **/
    validate: function(attrs, options) {
        // Require title OR ISBN.
        if (!this._checkForValue(attrs, "title") &&
            !this._checkForValue(attrs, "isbn")) {
            return "Missing title or ISBN.";
        } else if (_s.trim(attrs.title) === "" && _s.trim(attrs.isbn) === "") {
            // Keys exist but are empty strings.
            return "Missing title or ISBN.";
        }
    },

    // NON-STANDARD METHODS //
    /**
     * Change a status, adding activity logging for some changes.
     * @param  {String} statusKey   "read", "ownership", etc.
     * @param  {String} statusValue New value for key
     * @param  {String} asOfDate    iso8601-format date
     * @return {Object}             this
     */
    changeStatus: function(statusKey, statusValue, asOfDate) {
        var statusHash = {},
            activities,
            activityKey;

        // Change locally.
        statusHash = this.get("status") || {};
        statusHash[statusKey] = statusValue;
        this.set("status", statusHash);

        // Log "read" status.
        if (statusKey === "read") {
            // Get activity key for the new read status (if any).
            activityKey = this._configuration.getActivityForStatus(statusValue);

            // If a value exists for this key, log as an activity.
            if (!_.isNull(activityKey)) {
                activities = this.get("activities") || [];

                activities.push({"date": asOfDate, "action": activityKey});

                this.set("activities", activities);
            }
        }

        return this;
    },

    /**
     * Check if key exists and has a non-null value.
     **/
    _checkForValue: function(attrs, key) {
        return (_.has(attrs, key) && !_.isNull(attrs[key]));
    }
});

module.exports = Book;
