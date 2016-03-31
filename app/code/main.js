/**
 * Main entry point to simpleshelf app.
 */
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    appsetup = require("./appsetup.js"),
    appevents = require("./appevents.js"),
    simpleshelfApp = require("./app.js").app,
    Router = require("./router.js").Router;

// To support Bootstrap, add jQuery & Tether to the global namespace.
window.$ = window.jQuery = require('jquery');
window.Tether = require('tether');

$(document).ready(function() {
    // Load plugins and widgets on the global $.
    // require(["widgets/tags"]);

    // Override BB sync.
    appsetup.overrideBackboneSync(Backbone, _);

    this.app = simpleshelfApp; // singleton

    // Setup top-level app objects.
    this.app.router = new Router({
        views: this.app.views,
        catalog: this.app.catalog,
        configuration: this.app.configuration
    });
    appevents.setupAppEvents(this.app);
    appevents.hookupAppEvents(this.app);

    // Start Backbone routing.
    // NOTE: when silent===true, no views are automatically invoked.
    // So if the hash is on an existing route (like ``#login``), nothing will appear to happen.
    var historyStart = Backbone.history.start();
    console.info("[main]", "Backbone.history.start",
        historyStart, (historyStart ? "Found initial matching route" : "No initial matching route")
    );

    // Start app.
    this.app.promises.initialConfiguration.then(
        this.app.run
    );
});
