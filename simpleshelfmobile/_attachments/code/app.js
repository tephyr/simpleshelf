"use strict";
// Start the main app logic.
define([
    "jquery",
    "underscore",
    "backbone",
    "settings",
    "couchutils",
    "views/LoginPageView",
    "appevents"
], function($, _, Backbone, appSettings, couchUtils, 
    LoginPageView) {

    console.info("app.js loaded.");
    var app = {

    };

    // Allow this object to receive & emit events.
    _.extend(app, Backbone.Events);

    // Setup up views hash to hold view objects & persist them for the application lifetime.
    app.views = {
        loginPageView: new LoginPageView()
    };

    // Initial settings.
    appSettings.set({"urlPrefix": window.location.protocol + "//" + window.location.host});

    app.run = function() {
        console.info("App running as of ", new Date());
        // On initial load, check if user already logged in.
        // If so, proceed to main page.
        // If not, show login.
        couchUtils.isLoggedIn()
            .done(function() {
                console.log("Proceed to main page.");
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
    // require("appevents").setupAppEvents(app);

    return app;
});
