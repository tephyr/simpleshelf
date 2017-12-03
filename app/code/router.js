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
        // this._viewLogger = [];
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

        // Only load the spine collection *once*.
        // Since the view renders itself when the collection syncs, no need to call it here.
        $.when(
            Catalog.loadBooksByLetter(),
            Catalog.loadSpines()
        ).always(() => {
            const booksPageView = new BooksPageView({
                collection: Catalog.booksByLetterCollection,
                spineCollection: Catalog.spineCollection
            });
            this._changeScreen(booksPageView);
        });
    },

    book: function(bookId) {
        this._log("/book/" + bookId);
        const bookPageView = new BookPageView({
            model: new Book({_id: bookId}, {configuration: Catalog.configuration}),
            configuration: Catalog.configuration
        });

        $.when(
            bookPageView.model.fetch()
        ).always(() => {
            this._changeScreen(bookPageView);
        });
    },

    /**
     * Show the edit book view with no data.
     **/
    addbook: function() {
        this._log("/addbook");
        const editBookPageView = new EditBookPageView({
            model: new Book({}, {configuration: Catalog.configuration}),
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
        const editBookPageView = new EditBookPageView({
            model: new Book({_id: bookId}, {configuration: Catalog.configuration}),
            configuration: Catalog.configuration,
            tagCollection: Catalog.tagCollection
        });

        $.when(
            editBookPageView.model.fetch()
        ).always(_.bind(function(){
            this._changeScreen(editBookPageView);
        }, this));
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
            // Disconnect events.
            this._currentView.undelegateEvents();
            // Remove from DOM.
            this._currentView.remove();
        }

        this._currentView = view;
        $("#baseContent").append(view.render().$el);
        // this._currentPageId = view.$el.attr("id");  // TODO: switch to view.id.
        this._currentPageId = view.id;

/*        // Only call delegateEvents() once view is re-used, since initialize() automatically
        // calls it.
        // NOTE: this is **necessary** when view *instances* are held by the application. If
        // views were instantiated as needed, the events would always be applied and the second 
        // and subsequent uses of that view would behave exactly like the first.
        if (_.indexOf(this._viewLogger, this._currentPageId) !== -1) {
            // Subsequent use of this view: hook up events.
            view.delegateEvents();
        } else {
            this._viewLogger.push(this._currentPageId);
        }

        this._log("_viewLogger", this._viewLogger);
*/    },

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
