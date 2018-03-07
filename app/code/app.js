/**
 * Application logic.
 */
import {$} from 'DefaultImports';
import {appSettings} from 'settings';
import {Catalog} from 'Catalog';
import {NavigationView} from './views/NavigationView';
import {GlobalAlertView} from './views/GlobalAlertView';

const app = {
    catalog: Catalog
};

// Setup views hash to hold non-routable view objects & persist them for the application lifetime.
app.views = {
    navigationView: new NavigationView(),
    globalAlertView: new GlobalAlertView({
        configuration: Catalog.configuration
    })
};

// Initial settings.
appSettings.set({"urlPrefix": window.location.protocol + "//" + window.location.host});

app.run = function() {
    const _logHeader = "[app.run]";
    console.info(_logHeader, "App running as of ", new Date());

    app.catalog.tagCollection.fetch();

    // Load navbar view.
    $("body").prepend(app.views.navigationView.render().$el);
    // Load global alert view.
    $("#alertContent").append(app.views.globalAlertView.render().$el);
};

// Anything else that should be immediately available when the application launches, add here.

export {app};
