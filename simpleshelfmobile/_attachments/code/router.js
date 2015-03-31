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
            "login": "login",
            "main" : "main"
        },

        /**
         * Index route (default)
         */
        index: function() {
            this._log("/ route.");
            // this._changeScreen(app.views.frontPageView);
        },

        login: function() {
            this._log("/login");
            this._changeScreen(app.views.loginPageView);
        },

        main: function() {
            this._log("/main");
            $.when(
                app.views.mainPageView.model.fetch(),
                app.views.mainPageView.books.fetch()
            ).always(_.bind(function() {
                app.views.mainPageView.render();
                this._changeScreen(app.views.mainPageView);
            }, this));
        },

        /**
         * Change the current screen.
         * Instantiates the view if not already in DOM.
         */
        _changeScreen: function(view, options) {
            // Change to this view.
            $("body").pagecontainer("change", view.$el);
        },

        _log: function() {
            console.log("[router]", _.toArray(arguments).join(" "));
        }

    });

    return Router;
});
