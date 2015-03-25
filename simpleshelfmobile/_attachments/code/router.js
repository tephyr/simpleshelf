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
            this._changeScreen(app.views.mainPageView);
        },

        /**
         * Change the current screen.
         * Instantiates the view if not already in DOM.
         */
        _changeScreen: function(view, options) {
            if (!view.isInDOM) {
                console.info("[router]", "Rendering " + view.getName());
                // Render view & get handle to object.
                view.render();
                // Call post-render actions.
                if (view.postRender) {
                    view.postRender();
                }
                // Initialize the jqm page widget for this new element.
                view.$el.page({});
                view.$el.trigger('create');
            }
            // Change to this view.
            $.mobile.pageContainer.pagecontainer("change", view.$el, options);
        },

        _log: function() {
            console.log("[router]", _.toArray(arguments).join(" "));
        }

    });

    return Router;
});
