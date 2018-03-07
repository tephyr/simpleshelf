/**
 * Application configuration model.
 * Handles default (updateable through replication) and custom.
 * Documents: simpleshelf-config-default.json, simpleshelf-config-custom.json
 *     (with CouchDB _ids equal to their filename sans extension).
 * 
 * @return Singleton
 **/
import {$, _, Backbone} from 'DefaultImports';

const ConfigurationModel = Backbone.Model.extend({
    _logHeader: "[ConfigurationModel]",
    url: "view/configuration",
    urlI18N: "data/simpleshelf-i18n-default",
    initialize: function() {
        this.lang = "en";
        this.translations = {};
    },

    parse: function(response, options) {
        // - Find row with .key === "default"
        // - Use that as base.
        // - Apply other config objects.
        let result = {}, configs;

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            if (response.rows.length > 0) {
                // TODO: use _.chain().
                configs = _.sortBy(response.rows, function(cfgDoc) {
                    return (cfgDoc.key === "default") ? 0 : 1;
                });
                configs = _.map(configs, (x) => { return this._stripConfig(x.value); });
                _.each(configs, function(cfg) {
                    _.assignIn(result, cfg);
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
            _.assignIn(activityStuff, actionsByStatus);
        });

        if (_.has(activityStuff, statusValue)) {
            result = activityStuff[statusValue]
        }

        return result;
    },

    /**
     * Get messages for any particular view, or 'global'.
     * @param  {String} viewName Name of view, or 'global'
     * @return {Object}          {alertType, alertMsg, dismiss: t/f}
     */
    getMessagesForView: function(viewName) {
        var tmpO,
            score = {
                success: 20,
                info: 15,
                warning: 10,
                danger: 5
            };

        if (_.isNil(this.get('messages'))) return {};

        // Map messages to view format.
        var msgs = _.map(this.get('messages')[viewName], function(msg) {
            if (_.has(msg, 'dismiss')) {
                tmpO = {dismiss: msg.dismiss};
            } else {
                tmpO = {dismiss: true};
            }

            _.each(['warning', 'info', 'success', 'danger'], function(level) {
                if (_.has(msg, level)) {
                    tmpO.alertType = level;
                    tmpO.alertMsg = msg[level];
                }
            });
            return tmpO;
        });

        try {
            msgs = _.sortBy(msgs, function(msg) {
                return score[msg.alertType];
            });
        } catch(exc) {
            // Don't worry if config had a bad key, just show the messages unsorted.
        }

        return msgs;
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
        return _.assignIn(
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

export {ConfigurationModel};
