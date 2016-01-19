"use strict";
var _ = require("underscore"),
    couchUtils = require("./couchutils.js");

// app is already instantiated (as singleton), so simply add events to it.
module.exports = {
    setupAppEvents: function (app) {
        var _logHeader = "[app]";

        app.on({
            "app:bookChanged": function(data) {
                // Notify catalog that metadata must be refreshed.
                console.info(_logHeader, "bookChanged", data);
                app.catalog.metadataUpToDate = false;
            },

            "app:requestLogin": function(data) {
                console.info(_logHeader, "requestLogin", data);
                couchUtils.login(data.username, data.password)
                    .done(function() {
                        console.log(_logHeader, "Logged in!");
                        // Proceed to main page.
                        app.trigger("app:navigate", {url: "main"});
                    })
                    .fail(function() {
                        console.warn(_logHeader, "Login failed!");
                        // Stay on current page.
                        // TODO: warn user about login failure.
                    });
            },

            "app:navigate": function(data) {
                var url;
                // This call is a little different than the native Backbone navigate,
                // to keep it similar to all other calls: {url: String, options: Object}.
                console.info(_logHeader, "navigate", data);
                // By default, trigger the route method; to disable, set ``trigger==false``.
                // This is opposite of Backbone's default.
                if (_.has(data, "url")) {
                    app.router.navigate(data.url, _.extend({trigger: true}, data.options));
                } else {
                    // Construct URL from data.
                    switch(data.view) {
                        case "book":
                            url = "books/" + data.id;
                            break;
                        default:
                            url = "main";
                            break;
                    }

                    app.router.navigate(url, _.extend({trigger: true}, data.options));
                }
            }

        });
    },

    /**
     * Direct way to connect views to app event handler.
     * Each view must be connected to the event router **here**.
     **/
    hookupAppEvents: function (app) {
        // Hook up specific views' events.
        _.each([app.views.loginPageView, app.views.mainPageView, app.views.editBookPageView],
            function(view) {
                view.on("all", _.bind(function(eventName, data) {
                    app.trigger(eventName, data);
                }, this));
            }, this);
        // app.views.loginPageView.on("all", _.bind(function(eventName, data) {
        //     app.trigger(eventName, data);
        // }, this));
    },

    setupJQMEvents: function(app) {
        $("body").on("pagecontainerchange", function(event, ui) {
            console.info("[JQM.pagecontainerchange]",
                "from " + ui.prevPage.attr("id"),
                "to " + ui.toPage.attr("id"));

            // Perform page-specific actions post-change.
            if (ui.toPage.attr("id") === "main") {
                console.info("[JQM.pagecontainerchange]", "refreshing listview for #main");
            }
        });
    }
};
