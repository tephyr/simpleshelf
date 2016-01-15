var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    appsetup = require("./appsetup.js"),
    appevents = require("./appevents.js"),
    simpleshelfApp = require("./app.js").app,
    Router = require("./router.js");

$(document).ready(function() {
    // Load plugins and widgets on the global $.
    // require(["widgets/tags"]);

    // Override BB sync.
    appsetup.overrideBackboneSync(Backbone, _);

    this.app = simpleshelfApp; // singleton

    // Setup top-level app objects.
    this.app.router = new Router();
    appevents.setupAppEvents(this.app);
    appevents.hookupAppEvents(this.app);

    // Tidy initial view.
    $("body").removeClass("splash");

    // Start Backbone routing.
    Backbone.history.start();

    // Start app.
    this.app.run();
});
