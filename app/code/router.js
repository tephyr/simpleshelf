/**
 * Handle all routes.
 **/
import {$, _, Backbone} from 'DefaultImports';
import {Book} from './models/Book';
import {Hub} from 'Hub';
import {Catalog} from 'Catalog';
import {CouchUtils} from 'couchutils';
import {LoginPageView} from './views/LoginPageView';
import {MainPageView} from './views/MainPageView';
import {BooksPageView} from './views/BooksPageView';
import {BookPageView}  from './views/BookPageView';
import {EditBookPageView} from './views/EditBookPageView.js';

// Define the application router.
const Router = Backbone.Router.extend({
    routes: {
        ""          : "main", // Use main as primary view.
        "login"     : "login",
        "main"      : "main",
        "books"     : "books",
        "books/:id" : "book",
        "addbook"   : "addbook",
        "editbook/:id": "editbook"
    },

    initialize: function(options) {
        this._logHeader = "[router]";
        this._currentPageId = null;
        this._currentView = null;
        this._initialLoginHandled = false;
        this._configuration = options.configuration;

        this.listenTo(Hub, 'router:navigate', this.onNavigate);
        this.on('route', (route, params) => { Hub.trigger('routechanged', {route, params}); });
    },

    /**
     * Fires before every route function.
     * @param  {Function} callback Route handler
     * @param  {Object(?)}   args     arguments
     * @param  {String}   name
     * @return {Undef}
     */
    execute: function(callback, args, name) {
        /* jshint unused: false */
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
        if (callback){
            callback.apply(this, args);
        }
    },

    login: function() {
        this._log("/login");
        this._changeScreen(new LoginPageView());
    },

    main: function() {
        this._log("/main");
        $.when(
            Catalog.updateLibraryMetadata()
        ).always(() => {
            const mainPageView = new MainPageView({
                model: Catalog.globalCountModel,
                readingStats: Catalog.readingStatsModel
            });
            mainPageView.books = Catalog.bookCollection; // TODO: pass in as option.
            this._changeScreen(mainPageView);
        });
    },

    books: function() {
        this._log("/books");
        // TODO: ensure collection loaded before showing view.
        const booksPageView = new BooksPageView({
            collection: Catalog.bookCollection,
        });
        this._changeScreen(booksPageView);
    },

    book: function(bookId) {
        this._log("/book/" + bookId);
        const book = Catalog.bookCollection.get(bookId);
        const bookPageView = new BookPageView({
            model: book,
            configuration: Catalog.configuration
        });

        this._changeScreen(bookPageView);
    },

    /**
     * Show the edit book view with no data.
     **/
    addbook: function() {
        this._log("/addbook");
        const editBookPageView = new EditBookPageView({
            model: new Book({}),
            configuration: Catalog.configuration,
            tagCollection: Catalog.tagCollection
        });
        this._changeScreen(editBookPageView);
    },

    /**
     * Show the edit book view with existing data.
     **/
    editbook: function(bookId) {
        this._log("/editbook", bookId);
        const book = Catalog.bookCollection.get(bookId);
        const editBookPageView = new EditBookPageView({
            model: book,
            configuration: Catalog.configuration,
            tagCollection: Catalog.tagCollection
        });

        this._changeScreen(editBookPageView);
    },

    onNavigate: function(fragment, options) {
        this.navigate(fragment, options);
    },

    /**
     * Change to another view.
     */
    _changeScreen: function(view, options) {
        /* jshint unused: false */
        if (!_.isNull(this._currentView)) {
            // Replacing view - kill existing.
            this._log("Changing from " + this._currentPageId);
            // Remove from DOM.
            this._currentView.remove();
        }

        this._currentView = view;
        $("#baseContent").append(view.render().$el);
        this._currentPageId = view.id;

    },

    /**
     * On initial load, check if user is already logged in.
     * If so, proceed to requested page.
     * If not, show login.
     *
     * @return {Promise}
     */
    _checkLoginStatus: function(routeCB, routeArgs, routeContext) {
        return CouchUtils.isLoggedIn()
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

export default Router;
