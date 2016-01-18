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
        "": "index",
        "login": "login",
        "main" : "main",
        "books": "books",
        "books/:id": "book",
        "addbook": "addbook"
    },

    initialize: function(options) {
        this._currentPageId = null;
        this._currentView = null;
        this._views = options.views;
        this._catalog = options.catalog;
    },

    /**
     * Index route (default)
     */
    index: function() {
        this._log("/ route.");
        // this._changeScreen(this._views.frontPageView);
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
        if (!_.isNull(this._currentPageId)) {
            // Replacing view - kill existing.
            this._log("Changing from " + this._currentPageId);
            this._currentView.remove();
            $("div#baseContent").empty();
        }
        this._currentView = view;
        this._currentPageId = view.$el.attr("id");
        $("#baseContent").append(view.render().$el);
    },

    _log: function() {
        console.info("[router]", _.toArray(arguments).join(" "));
    }

});

module.exports = Router;
