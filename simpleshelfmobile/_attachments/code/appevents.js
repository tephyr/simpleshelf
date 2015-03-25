"use strict";
// Start the main app logic.
define([
    "underscore",
    "couchutils"
], function(_, couchUtils) {
    // app is already instantiated (as singleton), so simply add events to it.
    var eventInitializer = {
        setupAppEvents: function (app) {
            app.on({
                "app:requestLogin": function(data) {
                    console.info("[app]", "requestLogin", data);
                    couchUtils.login(data.username, data.password)
                        .done(function() {
                            console.log("Logged in!");
                            // Proceed to main page.
                            app.trigger("app:navigate", {url: "main"});
                        })
                        .fail(function() {
                            console.warn("Login failed!");
                            // Stay on current page.
                            // TODO: warn user about login failure.
                        });
                },
                "app:navigate": function(data) {
                    // This call is a little different than the native Backbone navigate,
                    // to keep it similar to all other calls: {url: String, options: Object}.
                    console.info("[app]", "navigate", data);
                    // By default, trigger the route method; to disable, set ``trigger==false``.
                    // This is opposite of Backbone's default.
                    app.router.navigate(data.url, _.extend({trigger: true}, data.options));
                }

            });
        },

        /**
         * Direct way to connect views to app event handler.
         * Each view must be connected to the event router **here**.
         **/
        hookupAppEvents: function (app) {
            // Hook up specific views' events.
            _.each([app.views.loginPageView, app.views.mainPageView],
                function(view) {
                    view.on("all", _.bind(function(eventName, data) {
                        app.trigger(eventName, data);
                    }, this));
                }, this);
            // app.views.loginPageView.on("all", _.bind(function(eventName, data) {
            //     app.trigger(eventName, data);
            // }, this));
        }
    };

    return eventInitializer;
});
