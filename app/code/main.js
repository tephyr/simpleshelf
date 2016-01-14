var appsetup = require("./appsetup.js"),
    appevents = require("./appevents.js");

console.info(window.pageLoadedAt);

// Load plugins and widgets on the global $.
// require(["widgets/tags"]);

// Override BB sync.
appsetup.overrideBackboneSync(Backbone, _);

this.app = App; // singleton

// Setup top-level app objects.
app.router = new Router();
appevents.setupAppEvents(app);
appevents.hookupAppEvents(app);

// Tidy initial view.
$("body").removeClass("splash");

// Start Backbone routing.
Backbone.history.start();

// Start app.
this.app.run();
