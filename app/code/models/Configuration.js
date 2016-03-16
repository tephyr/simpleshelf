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
    }
});

module.exports = ConfigurationModel;
