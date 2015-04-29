"use strict";
// Start the main app logic.
define([
    "jquery",
    "underscore",
    "backbone",
    "settings",
    "couchutils",
    "views/LoginPageView",
    "views/MainPageView",
    "views/BooksPageView",
    "views/BookPageView",
    "views/EditBookPageView",
    "models/GlobalCount",
    "models/BookCollection",
    "models/BooksByLetterCollection",
    "models/SpineCollection",
    "models/Book",
    "appevents"
], function($, _, Backbone, appSettings, couchUtils, 
    LoginPageView, MainPageView, BooksPageView, BookPageView, EditBookPageView,
    GlobalCountModel, BookCollection, BooksByLetterCollection, SpineCollection, BookModel) {

    console.info("app.js loaded.");
    var app = {
        // Catalog: all metadata regarding the library.
        // Typically, these data will change only when a books is added/edited/deleted.
        catalog: {
            spinesInitialized: false,
            booksByLetterInitialized: false,
            spineCollection: new SpineCollection(),
            booksByLetterCollection: new BooksByLetterCollection(),
            /**
             * Load the spines collection, fetching only when necessary.
             **/
            loadSpines: function(forceLoad) {
                var deferred = $.Deferred();
                if (!this.spinesInitialized || forceLoad) {
                    this.spineCollection.fetch()
                        .done(function() {
                            deferred.resolve();
                        })
                        .fail(function() {
                            deferred.reject();
                        })
                        .always(_.bind(function() {
                            this.spinesInitialized = true;
                        }, this));
                } else {
                    deferred.resolve();
                }

                return deferred;
            },
            /**
             * Load the books-by-letter collection, fetching only when necessary.
             **/
            loadBooksByLetter: function(forceLoad) {
                var deferred = $.Deferred();
                if (!this.booksByLetterInitialized || forceLoad) {
                    this.booksByLetterCollection.fetch()
                        .done(deferred.resolve)
                        .fail(deferred.reject)
                        .always(_.bind(function() {
                            this.booksByLetterInitialized = true;
                        }, this));
                } else {
                    deferred.resolve();
                }

                return deferred;
            }
        }
    };

    // Allow this object to receive & emit events.
    _.extend(app, Backbone.Events);

    // Setup up views hash to hold view objects & persist them for the application lifetime.
    app.views = {
        loginPageView: new LoginPageView({el: "#login"}),
        mainPageView: new MainPageView({
            el: "#main",
            model: new GlobalCountModel(),
        }),
        booksPageView: new BooksPageView({
            el: "#books",
            collection: app.catalog.booksByLetterCollection,
            spineCollection: app.catalog.spineCollection
        }),
        bookPageView: new BookPageView({
            el: "#book",
            model: new BookModel()
        }),
        editBookPageView: new EditBookPageView({
            el: "#editbook"
        })
    };
    // Add BookCollection to mainPageView.  Don't know why it won't work on initialization.
    app.views.mainPageView.books = new BookCollection();

    // Initial settings.
    appSettings.set({"urlPrefix": window.location.protocol + "//" + window.location.host});

    app.run = function() {
        console.info("App running as of ", new Date());
        // On initial load, check if user is already logged in.
        // If so, proceed to main page.
        // If not, show login.
        couchUtils.isLoggedIn()
            .done(function() {
                console.log("Proceed to main page.");
                app.trigger("app:navigate", {url: "main"});
            })
            .fail(function() {
                console.warn("Need to log in.");
                app.router.navigate("login", {trigger: true});
            })
            .always(function() {
                console.info("Done checking login status.");
            });
    };

    // Anything else that should be immediately available when the application launches, add here.

    return app;
});
