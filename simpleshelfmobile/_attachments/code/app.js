"use strict";
// Start the main app logic.
define([
    "jquery",
    "underscore",
    "backbone",
    "settings",
    "couchutils",
    "views/LoginPageView",
    "views/MainPageView",
    "models/GlobalCount",
    "models/BookCollection",
    "appevents"
], function($, _, Backbone, appSettings, couchUtils, 
    LoginPageView, MainPageView, GlobalCountModel, BookCollection) {

    console.info("app.js loaded.");
    var app = {

    };

    // Allow this object to receive & emit events.
    _.extend(app, Backbone.Events);

    // Setup up views hash to hold view objects & persist them for the application lifetime.
    app.views = {
        loginPageView: new LoginPageView(),
        mainPageView: new MainPageView({
            model: new GlobalCountModel(),
        })
    };
    // Add BookCollection to mainPageView.  Don't know why it won't work on initialization.
    app.views.mainPageView.books = new BookCollection();

    // Initial settings.
    appSettings.set({"urlPrefix": window.location.protocol + "//" + window.location.host});

    app.run = function() {
        console.info("App running as of ", new Date());
        // On initial load, check if user is already logged in.
        // If so, proceed to main page.
        // If not, show login.
        couchUtils.isLoggedIn()
            .done(function() {
                console.log("Proceed to main page.");
                app.trigger("app:navigate", {url: "main"});
            })
            .fail(function() {
                console.warn("Need to log in.");
                app.router.navigate("login", {trigger: true});
            })
            .always(function() {
                console.info("Done checking login status.");
            });
    };

    // Anything else that should be immediately available when the application launches, add here.

    return app;
});
