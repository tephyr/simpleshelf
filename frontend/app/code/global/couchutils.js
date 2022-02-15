/**
 * Utilities for accessing CouchDB.
 **/
import {$, _} from 'DefaultImports';
import {appSettings} from 'settings';

const CouchUtils = {
    /**
     * Get UUIDs directly from CouchDB.
     **/
    getUUIDs: function() {
        // Returns list of UUIDs (defaults to 1 item).
        var dfrd = $.Deferred();
        $.ajax({
            url: "/_uuids",
            dataType: "json"
        }).done(function(data) {
            var uuids = data.uuids;
            dfrd.resolve(uuids);
        }).fail(function() {
            dfrd.reject();
        });

        return dfrd;
    },

    /**
     * Determine if current session is active.
     * @return Promise
     **/
    isLoggedIn: function() {
        var dfrd = $.Deferred();

        $.ajax({
            url: appSettings.get("urlPrefix") + "/auth/_session",
            dataType: "json"
        }).done(function(data) {
            // Payload must have userCtx.name !== null.
            if (_.has(data, "userCtx") && (!_.isNull(data.userCtx.name))) {
                dfrd.resolve();
            } else {
                dfrd.reject();
            }
        }).fail(function() {
            dfrd.reject();
        })

        return dfrd;
    },

    /**
     * Login to CouchDB
     * @return Promise
     */
    login: function(userName, password) {
        // $.Deferred callbacks: done, fail, always
        return $.ajax({
            type: "POST",
            url: appSettings.get("urlPrefix") + "/auth/_session",
            dataType: "json",
            data: {
                name: userName,
                password: password
            }
        });
    },

    logout: function() {
        return $.ajax({
            type: "DELETE",
            url: appSettings.get("urlPrefix") + "/auth/_session"
        });
    }

};

export {CouchUtils};
