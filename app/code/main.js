var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    appsetup = require("./appsetup.js"),
    appevents = require("./appevents.js"),
    simpleshelfApp = require("./app.js").app,
    Router = require("./router.js");

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
    this.app.router = new Router({views: this.app.views});
    appevents.setupAppEvents(this.app);
    appevents.hookupAppEvents(this.app);

    // Start Backbone routing.
    Backbone.history.start();

    // Start app.
    this.app.run();
});
