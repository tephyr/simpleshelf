"use strict";
/**
 * Handle all routes.
 */
define([
    "underscore",
    "backbone",
    "app"
], function(_, Backbone, app) {

    // Define the application router.
    var Router = Backbone.Router.extend({
        routes: {
            "": "index",
            "login": "login"
        },

        /**
         * Index route (default)
         */
        index: function() {
            this._log("/ route.");
            this._changeScreen(app.views.frontPageView);
        },

        login: function() {
            this._log("/login");
            // TODO
        },

        _log: function() {
            console.log("[router]", _.toArray(arguments).join(" "));
        }

    });

    return Router;
});
