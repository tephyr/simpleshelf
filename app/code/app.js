/**
 * Application logic.
 */
import {$, _, Backbone} from 'DefaultImports';
import {appSettings} from 'settings';
var Handlebars = require("handlebars"),
    RegisterHandlebarHelpers = require("./handlebarhelpers.js"),
    GlobalAlertView = require("./views/GlobalAlertView.js"),
    HeaderIconsTemplate = require("./views/templates/headericons.html"),
    HeaderMenuTemplate = require("./views/templates/headermenu.html"),
    appevents = require("./appevents.js"),
    appsetup = require("./appsetup.js");
import {NavigationView} from './views/NavigationView';
import {Catalog} from 'Catalog';

var app = {
    catalog: Catalog
};

// Allow this object to receive & emit events.
_.extend(app, Backbone.Events);

// Prep Handlebars.
RegisterHandlebarHelpers();

app.promises = {};
app.promises.initialConfiguration = $.when(
    Catalog.configuration.fetch(),
    Catalog.configuration.fetchI18N()
).then(
    function() {
        console.info("[app]", "configuration + translation loaded");
    }, function() {
        console.warn("[app]", "configuration + translation failed to load");
    }
);

// Setup up views hash to hold view objects & persist them for the application lifetime.
// NOTE: this requires more app overhead to remove views & their events from the DOM.
// See router._changeScreen().
app.views = {
    navigationView: new NavigationView(),
    globalAlertView: new GlobalAlertView({
        configuration: Catalog.configuration
    })
};

// Initial settings.
appSettings.set({"urlPrefix": window.location.protocol + "//" + window.location.host});

app.run = function() {
    var _logHeader = "[app.run]";
    console.info(_logHeader, "App running as of ", new Date());

    app.catalog.tagCollection.fetch();

    // Load navbar view.
    $("body").prepend(app.views.navigationView.render().$el);
    // Load global alert view.
    $("#alertContent").append(app.views.globalAlertView.render().$el);
};

// Anything else that should be immediately available when the application launches, add here.

// Export app for module.
module.exports.app = app;
