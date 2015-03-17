"use strict";
// Start the main app logic.
define([
    "underscore",
    "backbone"
], function(_, Backbone) {

    console.info("app.js loaded.");
    var app = {

    };

    // Allow this object to receive & emit events.
    _.extend(app, Backbone.Events);

    // Setup up views hash to hold view objects & persist them for the application lifetime.
    app.views = {
        // TBD
    };

    app.run = function() {
        console.info("App running as of ", new Date());
    };

    // Anything else that should be immediately available when the application launches, add here.

    return app;
});
