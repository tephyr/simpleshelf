// Sets the require.js configuration for this application.
require.config( {

    baseUrl: "code",

    // 3rd party script alias names
    paths: {

        // Core Libraries
        "jquery": "lib/jquery",
        "jquerymobile": "lib/jquery.mobile-1.4.5",
        "underscore": "lib/underscore",
        "underscore.string": "lib/underscore.string",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "text": "lib/text"
    },

    // Sets the configuration for third party scripts that are not AMD compatible
    shim: {

        // "backbone": {
        //     "deps": [ "underscore", "jquery" ],
        //     "exports": "Backbone"
        // }

    }

});

// Includes File Dependencies
require([
    "jquery",
    "backbone",
    "underscore",
    "app",
    "router",
    "appevents",
    "appsetup"
], function ( $, Backbone, _, App, Router ) {

    $( document ).on( "mobileinit",

        // Set up the "mobileinit" handler before requiring jQuery Mobile's module
        function () {

            // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
            $.mobile.linkBindingEnabled = false;

            // Disabling this will prevent jQuery Mobile from handling hash changes
            $.mobile.hashListeningEnabled = false;

            $.mobile.defaultPageTransition = "slide";
        }
    )

    require( [ "jquerymobile" ], function () {

        console.info(window.pageLoadedAt);

        // Load plugins and widgets on the global $.
        require(["widgets/tags"]);

        // Override BB sync.
        require("appsetup").overrideBackboneSync(Backbone, _);

        this.app = App; // singleton

        // Setup top-level app objects.
        app.router = new Router();
        require("appevents").setupAppEvents(app);
        require("appevents").hookupAppEvents(app);

        // Tidy initial view.
        $("body").removeClass("splash");

        // Start Backbone routing.
        Backbone.history.start();

        // Start app.
        this.app.run();

    });
});
