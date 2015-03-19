/**
 * Utilities for accessing CouchDB.
 */
define([
    "jquery",
    "settings"
], function($, appSettings) {
    var couchUtils = {

        /**
         * Determine if current session is active.
         * @return Promise
         **/
        isLoggedIn: function() {
            var dfrd = $.Deferred();

            $.ajax({
                url: appSettings.get("urlPrefix") + "/_session",
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
                url: appSettings.get("urlPrefix") + "/_session",
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
                url: appSettings.get("urlPrefix") + "/_session"
            });
        }

    };

    return couchUtils;
});
