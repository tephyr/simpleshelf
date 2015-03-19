// Sets the require.js configuration for this application.
require.config( {

    baseUrl: "code",

    // 3rd party script alias names
    paths: {

        // Core Libraries
        "jquery": "lib/jquery",
        "jquerymobile": "lib/jquery.mobile-1.4.5",
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars"
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
    "app"
], function ( $, Backbone, App ) {

    $( document ).on( "mobileinit",

        // Set up the "mobileinit" handler before requiring jQuery Mobile's module
        function () {

            // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
            $.mobile.linkBindingEnabled = false;

            // Disabling this will prevent jQuery Mobile from handling hash changes
            $.mobile.hashListeningEnabled = false;
        }
    )

    require( [ "jquerymobile" ], function () {

        console.info(window.pageLoadedAt);
        this.app = App; // singleton
        this.app.run();

    });
});
