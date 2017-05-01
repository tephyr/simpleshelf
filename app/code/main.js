import Router from './router';

/**
 * Main entry point to simpleshelf app.
 */
let $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    appsetup = require("./appsetup.js"),
    appevents = require("./appevents.js"),
    simpleshelfApp = require("./app.js").app;

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
    // Read this before enabling pushState: http://stackoverflow.com/questions/9328513/backbone-js-and-pushstate
    let currentPath = location.pathname;
    let historyStart = Backbone.history.start({
        // pushState: true,
        root: currentPath
    });
    console.info("[main]", "Backbone.history.start",
        historyStart, (historyStart ? "Found initial matching route" : "No initial matching route"),
        'currentPath', currentPath
    );

    // Start app.
    this.app.promises.initialConfiguration.then(
        this.app.run
    );
});

