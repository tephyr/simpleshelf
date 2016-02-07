"use strict";
/**
 * Application configuration model.
 * Handles default (updateable through replication) and custom.
 * Documents: simpleshelf-config-default.json, simpleshelf-config-custom.json
 *     (with CouchDB _ids equal to their filename sans extension).
 * 
 * @return Singleton
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var ConfigurationModel = Backbone.Model.extend({
    _logHeader: "[ConfigurationModel]",
    url: "_view/configuration",
    parse: function(response, options) {
        // - Find row with .key === "default"
        // - Use that as base.
        // - TODO: apply other config objects.
        var defaultConfig, result = {};

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            if (response.rows.length > 0) {
                // Find default configuration.
                var defaultConfig = _.findWhere(response.rows, {key: "default"});
                if (defaultConfig) {
                    result.read = defaultConfig.value.read;
                    result.ownership = defaultConfig.value.ownership;
                    result.actions = defaultConfig.value.actions;
                }
            }
        }
        console.info(this._logHeader, result);
        return result;
    }
});

module.exports = ConfigurationModel;
