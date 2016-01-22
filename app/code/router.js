"use strict";
/**
 * Handle all routes.
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Book = require("./models/Book.js"),
    couchUtils = require("./couchutils.js");

// Define the application router.
var Router = Backbone.Router.extend({
    routes: {
        "": "main", // Use main as primary view.
        "login": "login",
        "main" : "main",
        "books": "books",
        "books/:id": "book",
        "addbook": "addbook"
    },

    initialize: function(options) {
        this._logHeader = "[router]";
        this._currentPageId = null;
        this._currentView = null;
        this._views = options.views;
        this._catalog = options.catalog;
        this._initialLoginHandled = false;
    },

    /**
     * Fires before every route function.
     * @param  {Function} callback Route handler
     * @param  {Object(?)}   args     arguments
     * @param  {String}   name
     * @return {Undef}
     */
    execute: function(callback, args, name) {
        if (!this._initialLoginHandled) {
            // On first load, always check for login state.
            this._initialLoginHandled = true;
            this._log("<execute>", "Handling login for first time");

            this._checkLoginStatus(callback, args, this);

            // Stop this route; Promise from _checkLoginStatus will forward to login.
            // TODO: once logged in, forward to initially requested page.
            return false;
        }

        // Continue with normal routing.
        if (callback) callback.apply(this, args);
    },

    login: function() {
        this._log("/login");
        this._changeScreen(this._views.loginPageView);
    },

    main: function() {
        this._log("/main");
        $.when(
            this._catalog.updateLibraryMetadata()
        ).always(_.bind(function() {
            this._changeScreen(this._views.mainPageView);
        }, this));
    },

    books: function() {
        this._log("/books");

        // Only load the spine collection *once*.
        // Since the view renders itself when the collection syncs, no need to call it here.
        $.when(
            this._catalog.loadBooksByLetter(),
            this._catalog.loadSpines()
        ).always(_.bind(function() {
            this._changeScreen(this._views.booksPageView);
        }, this));
    },

    book: function(bookId) {
        this._log("/book/" + bookId);
        this._views.bookPageView.model.clear({"silent": true});
        this._views.bookPageView.model.set("_id", bookId);
        $.when(
            this._views.bookPageView.model.fetch()
        ).always(_.bind(function() {
            this._views.bookPageView.render();
            this._changeScreen(this._views.bookPageView);
        }, this));
    },

    /**
     * Show the edit book view with no data.
     **/
    addbook: function() {
        this._log("/addbook");
        this._views.editBookPageView.model = new Book();
        this._views.editBookPageView.render();
        this._changeScreen(this._views.editBookPageView);
    },

    /**
     * Change to another view.
     */
    _changeScreen: function(view, options) {
        if (!_.isNull(this._currentView)) {
            // Replacing view - kill existing.
            this._log("Changing from " + this._currentPageId);
            this._currentView.remove();
            $("div#baseContent").empty();
        }
        this._currentView = view;
        $("#baseContent").append(view.render().$el);
        this._currentPageId = view.$el.attr("id");
    },

    /**
     * On initial load, check if user is already logged in.
     * If so, proceed to requested page.
     * If not, show login.
     *
     * @return {Promise}
     */
    _checkLoginStatus: function(routeCB, routeArgs, routeContext) {
        return couchUtils.isLoggedIn()
            .done(function() {
                console.log(routeContext._logHeader, "Proceed to requested page.");
                routeCB.apply(routeContext, routeArgs);
            })
            .fail(function() {
                console.warn(routeContext._logHeader, "Need to log in.");
                routeContext.login();
            })
            .always(function() {
                console.info(routeContext._logHeader, "Done checking login status.");
            });
    },

    _log: function() {
        console.info(this._logHeader, _.toArray(arguments).join(" "));
    }
});

module.exports.Router = Router;
