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

            "app:bookDeleted": function(data) {
                console.info(_logHeader, "deleteBook", data);
                if (data.ok) {
                    app.catalog.metadataUpToDate = false;
                    this.trigger("app:navigate", {url: "main"});
                } else {
                    window.alert("Oops - problem removing...");
                }
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

            'routerChange': function(data) {
                console.info(_logHeader, 'ROUTERCHANGE FIRED!', data);
                // Always notify navbar when route changes.
                let homeData = { home: data.route === 'main' };
                app.views.navbarView.setHomeView(homeData);
            }

        });
    },

    /**
     * Direct way to connect views to app event handler.
     * Each view must be connected to the event router **here**.
     **/
    hookupAppEvents: function (app) {
        // Hook up specific views' events.
        var views = [
            app.views.loginPageView,
            app.views.mainPageView,
            app.views.bookPageView,
            app.views.editBookPageView
        ];

        let fnBindAll = _.bind(function(eventName, data) {
            app.trigger(eventName, data);
        }, this)

        _.each(views, function(view) {
            view.on("all", fnBindAll);
        }, this);

        // Hookup router to app.
        app.router.on('all', fnBindAll);
        app.router.on('all', _.bind(function() {
            // Only match specific routes, by watching for ['route', SOMEROUTE, params]
            //  (3-item argument signature).  Makes it easier to check individual routes.
            if (arguments[0] === 'route') {
                let eventData = _.assign({route: arguments[1], params: arguments[2]});
                app.trigger('routerChange', eventData);
            }
        }, this));
    }
};
