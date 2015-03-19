/**
 * Utilities for accessing CouchDB.
 */
define([
    "jquery"
], function($) {
    var couchUtils = {
        /**
         * Login to CouchDB
         * @return Promise
         */
        login: function(userName, password, urlPrefix) {
            // $.Deferred callbacks: done, fail, always
            return $.ajax({
                type: "POST",
                url: urlPrefix + "/_session",
                dataType: "json",
                data: {
                    name: userName,
                    password: password
                }
            });
        },

        logout: function(urlPrefix) {
            return $.ajax({
                type: "DELETE",
                url: urlPrefix + "/_session"
            });
        }

    };

    return couchUtils;
});
