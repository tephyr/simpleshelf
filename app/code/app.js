"use strict";
/**
 * Application logic.
 */
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    appSettings = require("./settings.js"),
    couchUtils = require("./couchutils.js"),
    LoginPageView = require("./views/LoginPageView.js"),
    MainPageView = require("./views/MainPageView.js"),
    BooksPageView = require("./views/BooksPageView.js"),
    BookPageView = require("./views/BookPageView.js"),
    EditBookPageView = require("./views/EditBookPageView.js"),
    GlobalCountModel = require("./models/GlobalCount.js"),
    BookCollection = require("./models/BookCollection.js"),
    BooksByLetterCollection = require("./models/BooksByLetterCollection.js"),
    SpineCollection = require("./models/SpineCollection.js"),
    BookModel = require("./models/Book.js"),
    HeaderIconsTemplate = require("./views/templates/headericons.html"),
    HeaderMenuTemplate = require("./views/templates/headermenu.html"),
    appevents = require("./appevents.js"),
    appsetup = require("./appsetup.js");

var app = {
    // Catalog: all metadata regarding the library.
    // Typically, these data will change only when a books is added/edited/deleted.
    catalog: {
        spinesInitialized: false,
        booksByLetterInitialized: false,
        metadataUpToDate: false,
        spineCollection: new SpineCollection(),
        booksByLetterCollection: new BooksByLetterCollection(),
        globalCountModel: new GlobalCountModel(),
        bookCollection: new BookCollection(),
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
        },

        /**
         * Load (or reload) the global count and books data.
         * @return Promise
         **/
        updateLibraryMetadata: function() {
            var deferred = $.Deferred();

            if (this.metadataUpToDate) {
                deferred.resolve();
            } else {
                $.when(
                    this.globalCountModel.fetch(),
                    this.bookCollection.fetch()
                ).then(_.bind(function() {
                        this.metadataUpToDate = true;
                        deferred.resolve();
                    }, this),
                    deferred.reject
                );
            }

            return deferred;
        }
    }
};

// Allow this object to receive & emit events.
_.extend(app, Backbone.Events);

// Setup up views hash to hold view objects & persist them for the application lifetime.
app.views = {
    loginPageView: new LoginPageView(),
    mainPageView: new MainPageView({
        model: app.catalog.globalCountModel
    }),
    booksPageView: new BooksPageView({
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
app.views.mainPageView.books = app.catalog.bookCollection;

// Update headers for most views.
appsetup.updateHeaders(
    Handlebars,
    {
        headerIcons: HeaderIconsTemplate,
        headerMenu: HeaderMenuTemplate
    },
    [
        app.views.mainPageView,
        app.views.booksPageView,
        app.views.bookPageView,
        app.views.editBookPageView
    ]
);

// Initial settings.
appSettings.set({"urlPrefix": window.location.protocol + "//" + window.location.host});

app.run = function() {
    var _logHeader = "[app.run]";
    console.info(_logHeader, "App running as of ", new Date());
    // On initial load, check if user is already logged in.
    // If so, proceed to main page.
    // If not, show login.
    couchUtils.isLoggedIn()
        .done(function() {
            console.log(_logHeader, "Proceed to main page.");
            app.trigger("app:navigate", {url: "main"});
        })
        .fail(function() {
            console.warn(_logHeader, "Need to log in.");
            app.router.navigate("login", {trigger: true});
        })
        .always(function() {
            console.info(_logHeader, "Done checking login status.");
        });
};

// Anything else that should be immediately available when the application launches, add here.

// Export app for module.
module.exports = {
    app: app
};
