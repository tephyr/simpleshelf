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
        "logout"    : "logout",
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
        this._constantViews = {}; // Hold view instance behind a particular route.

        this.listenTo(Hub, 'router:navigate', this.onNavigate);
        this.listenTo(Hub, 'app:userloggedout', this.onLogout);
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
            this._log("<execute>", "Handling login for first load (or post-logout)");

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

    logout: function() {
        this._log("/logout");
        this._initialLoginHandled = false;
        Hub.trigger('app:requestlogout');
    },

    main: function() {
        this._log("/main");
        $.when(
            Catalog.updateLibraryMetadata(),
            Catalog.fetchBooks()
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
        this._log('/books', 'view ready?', _.has(this._constantViews, 'books'));
        // TODO: ensure collection loaded before showing view.
        if (!_.has(this._constantViews, 'books')) {
            this._constantViews.books = new BooksPageView({
                collection: Catalog.bookCollection,
            });
        }

        this._changeScreen(this._constantViews.books);
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
        const book = new Book({});
        const editBookPageView = new EditBookPageView({
            model: book,
            catalog: Catalog
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
            catalog: Catalog
        });

        this._changeScreen(editBookPageView);
    },

    onLogout: function() {
        _.forOwn(this._constantViews, (value, key) => {
            value.remove();
        });
        this._constantViews = {};
    },

    onNavigate: function(fragment, options) {
        this.navigate(fragment, options);
    },

    /**
     * Change to another view.
     */
    _changeScreen: function(view, options) {
        // TODO: delegate/undelegate other constantViews.
        if (this._currentView === this._constantViews.books) {
            this._currentView.undelegateEvents();
            this._currentView.$el.hide();
        } else if (!_.isNull(this._currentView)) {
            // Remove from DOM.
            this._currentView.remove();
        }

        this._currentView = view;

        // TODO: handle other constantViews.
        if (this._currentView === this._constantViews.books) {
            if (this._currentView.isRendered()) {
                this._currentView.delegateEvents();
                this._currentView.$el.show();
            } else {
                $("#baseContent").append(this._currentView.render().$el);
            }
        } else {
            $("#baseContent").append(view.render().$el);
        }

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
        const self = this;
        return CouchUtils.isLoggedIn()
            .done(function() {
                console.log(routeContext._logHeader, "Proceed to requested page.");
                self._initialLoginHandled = true;
                routeCB.apply(routeContext, routeArgs);
            })
            .fail(function() {
                console.warn(routeContext._logHeader, "Need to log in.");
                routeContext.login();
                self._initialLoginHandled = false;
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
