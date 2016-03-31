"use strict";
/**
 * Application configuration model.
 * Handles default (updateable through replication) and custom.
 * Documents: simpleshelf-config-default.json, simpleshelf-config-custom.json
 *     (with CouchDB _ids equal to their filename sans extension).
 * 
 * @return Singleton
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");

var ConfigurationModel = Backbone.Model.extend({
    _logHeader: "[ConfigurationModel]",
    url: "_view/configuration",
    urlI18N: "data/simpleshelf-i18n-default",
    initialize: function() {
        this.lang = "en";
        this.translations = {};
    },

    parse: function(response, options) {
        // - Find row with .key === "default"
        // - Use that as base.
        // - Apply other config objects.
        var result = {}, configs;

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            if (response.rows.length > 0) {
                // TODO: use _.chain().
                configs = _.sortBy(response.rows, function(cfgDoc) {
                    return (cfgDoc.key === "default") ? 0 : 1;
                });
                configs = _.pluck(configs, "value");
                configs = _.map(configs, this._stripConfig);
                _.each(configs, function(cfg) {
                    result = _.extendOwn(result, cfg);
                });
                result = _.omit(result, "configurationType");
            }
        }

        return result;
    },

    fetchI18N: function() {
        var dfrd = $.Deferred(),
            self = this;

        $.ajax({
            url: this.urlI18N,
            dataType: "json"
        }).done(function(data) {
            self.translations = self._combineTranslations(data);
            dfrd.resolve(data);
        }).fail(function() {
            dfrd.reject();
        });

        return dfrd;
    },

    getActivityForStatus: function(statusValue) {
        // Combine all primary keys.
        var activityStuff = {},
            result = null;

        _.map(this.get("actions"), function(actionsByStatus) {
            _.extendOwn(activityStuff, actionsByStatus);
        });

        if (_.has(activityStuff, statusValue)) {
            result = activityStuff[statusValue]
        }

        return result;
    },

    /**
     * Get translated text for a key.
     * @param  {String} key
     * @return {String}     translated text
     */
    getText: function(key) {
        return _.has(this.translations, key) ? this.translations[key] : null;
    },

    /**
     * Combined translated text for easy lookup
     * @param  {Object} data i18n document
     * @return {Object}      {key: translation}
     */
    _combineTranslations: function(data) {
        return _.extendOwn(
            {},
            data.statuses[this.lang],
            data.actions[this.lang]
        );
    },

    /**
     * Return a config doc with just the goodies.
     * @param  {Object} cfgDoc Config document
     * @return {Object}        Config doc stripped of _id, _rev attributes
     */
    _stripConfig: function(cfgDoc) {
        return _.omit(cfgDoc, ["_id", "_rev", "type"]);
    }
});

module.exports = ConfigurationModel;
