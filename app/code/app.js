/**
 * Application logic.
 */
import {$, _, Backbone} from 'DefaultImports';
import {appSettings} from 'settings';
var Handlebars = require("handlebars"),
    RegisterHandlebarHelpers = require("./handlebarhelpers.js"),
    MainPageView = require("./views/MainPageView.js"),
    GlobalAlertView = require("./views/GlobalAlertView.js"),
    BooksPageView = require("./views/BooksPageView.js"),
    BookPageView = require("./views/BookPageView.js"),
    AppConfigurationModel = require("./models/Configuration.js"),
    EditBookPageView = require("./views/EditBookPageView.js"),
    ReadingStatsModel = require("./models/ReadingStats.js"),
    BooksByLetterCollection = require("./models/BooksByLetterCollection.js"),
    SpineCollection = require("./models/SpineCollection.js"),
    TagCollection = require("./models/TagCollection.js"),
    HeaderIconsTemplate = require("./views/templates/headericons.html"),
    HeaderMenuTemplate = require("./views/templates/headermenu.html"),
    appevents = require("./appevents.js"),
    appsetup = require("./appsetup.js");
import {Book} from './models/Book';
import {BookCollection} from './models/BookCollection';
import {GlobalCountModel} from './models/GlobalCount';
import {NavigationView} from './views/NavigationView';

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
        readingStatsModel: new ReadingStatsModel(),
        bookCollection: new BookCollection(),
        tagCollection: new TagCollection(),
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
                    this.readingStatsModel.fetch(),
                    this.bookCollection.fetch(),
                    this.spineCollection.fetch()
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

// Prep Handlebars.
RegisterHandlebarHelpers();

app.configuration = new AppConfigurationModel();
app.promises = {};
app.promises.initialConfiguration = $.when(
    app.configuration.fetch(),
    app.configuration.fetchI18N()
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
    mainPageView: new MainPageView({
        model: app.catalog.globalCountModel,
        readingStats: app.catalog.readingStatsModel
    }),
    globalAlertView: new GlobalAlertView({
        configuration: app.configuration
    }),
    booksPageView: new BooksPageView({
        collection: app.catalog.booksByLetterCollection,
        spineCollection: app.catalog.spineCollection
    }),
    bookPageView: new BookPageView({
        model: new Book(),
        configuration: app.configuration
    }),
    editBookPageView: new EditBookPageView({
        configuration: app.configuration,
        tagCollection: app.catalog.tagCollection
    })
};
// Add BookCollection to mainPageView.  Don't know why it won't work on initialization.
app.views.mainPageView.books = app.catalog.bookCollection;

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
