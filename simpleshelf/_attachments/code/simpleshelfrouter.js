/**
 * router for simpleshelf
 */
window.SimpleShelfLibrary = Backbone.Router.extend({
    routes: {
        '': 'home',
        'auth': 'authenticate',
        'tags/:tagName': 'tags',
        'books/:bookId': 'bookView',
        'books/:bookId/edit': 'bookEdit'
    },
    
    initialize: function(options){
        console.log("initializing SimpleShelfLibrary (Backbone.Router)");
        _.bindAll(this, 'home', 'authenticate', 'tags', 'bookView', 'bookEdit',
            '_loadBookView', '_loadData', '_loadEditBookView');
        this.appView = options.appView;

        /*this.infoView = new LibraryInfoView({
            collection: window.library
        });*/

        this.navigationView = new NavigationView({
            model: window.authInfo,
            dispatcher: window.dispatcher,
            okToLog: true
        });

        this.tagCloudView = new TagCloudView({
            dispatcher: window.dispatcher,
            collection: window.tagList,
            okToLog: true
        });

        // prep UI objects
        this._profile = $("#profile");
        this._items = $('#items');
        this._sidebar = $('#sidebar');

        // one-time setup
        this._profile.append(this.navigationView.render().el);
        this._sidebar.append(this.tagCloudView.render().el);
    },
    
    /**
     * Route for the index
     */
    home: function() {
        console.log("Routing to home");
        // verify logged-in
        var authStatus = window.authInfo.get('status');
        if (authStatus == null || authStatus == 'loggedOut'){
            // TODO: if authStatus null, retrieve session before deciding what to do
            // empty all collections
            window.spineList.reset();
            window.tagList.reset();

            //this.navigate('auth/');
            this.authenticate({'action': 'getcredentials'});
        } else {
            this.tagCloudView.resetTags(false);
            window.spineList.resetFilter();
            var me = this;
            window.spineList.fetch({silent: true, success: function(collection, response){
                console.log('Route / spineList fetch succeeded; count:', collection.length);
                me.appView.showView(new SpineListView({
                    dispatcher: window.dispatcher,
                    collection: window.spineList
                }), {log: true});
            }});
        }
        window.dispatcher.trigger('router:home');
    },

    /**
     * Route for authentication
     */
    authenticate: function(options){
        // if we have no auth status, retrieve it first
        if (_.isEmpty(window.authInfo.get('status'))){
            window.authInfo.getSession();
            return;
        }

        options = _.extend({}, options);
        var action = options.action || null;
        // event fired & routed here, follow given actions
        if (action == null && window.authInfo.get('status') == 'loggedIn'){
            // logged in; get data & head home
            this._loadData();
            window.dispatcher.trigger('authenticate:loggedin');
            window.app.home();
            return;
        }

        switch(action){
            case 'login':
                // login to couch
                var loginOptions = _.extend(options, {
                    error: function(status, error, reason){
                        window.alert('The login failed with this error: ' + error + 
                            '\nand this reason: ' + reason);
                        // leave current view in place, so user can retry
                }});
                window.authInfo.doLogin(loginOptions);
                break;

            case 'logout':
                window.authInfo.doLogout();
                break;

            case 'getcredentials':
            default:
                // show login view
                this.appView.showView(new AuthenticationView({
                    dispatcher: window.dispatcher,
                    model: window.authInfo,
                    action: 'getcredentials'
                }));
                window.dispatcher.trigger('authenticate:askedforcredentials');
                break;
        }
        // TODO: signup, logout
    },

    /**
     * Route for a specific tag
     */
    tags: function(tagName){
        console.log("Routing to tag", tagName);
        
        var me = this;
        var afterFetch = function(collection, response){
            me.appView.showView(new SpineListView({
                dispatcher: window.dispatcher,
                collection: window.spineList
            }));
        };

        if (tagName){
            window.spineList.filterByTag({'tag': tagName})
                .fetch({silent: true, success: afterFetch});
        } else {
            window.spineList.resetFilter()
                .fetch({silent: true, success: afterFetch});
        }
    },

    /**
     * Route for a specific book
     */
    bookView: function(bookId){
        console.log('Routing to book', bookId);
        // TODO: setup couchdb's routes & sync w/next line
        // Backbone.history.navigate('./books/' + bookId);
        
        var me = this;
        
        if (bookId == null){
            // new book
            this._loadEditBookView();
        } else {
            // get requested book
            var book = new Book({id: bookId});
            book.fetch({success: this._loadBookView});
        }
    },
    
    /**
     * Route for editing a specific book
     */
    bookEdit: function(bookId){
        console.log('Routing to edit book', bookId);
        var me = this;
        var book = new Book({id: bookId});
        book.fetch({success: function(model, response){
            me._loadEditBookView({'book': model});
        }
        });
    },

    _loadBookView: function(model, response){
        // create & show book view
        var bookView = new BookView({
            dispatcher: window.dispatcher,
            model: model});
        this.appView.showView(bookView);
        window.dispatcher.trigger('router:loadbook');
    },
    
    _loadEditBookView: function(options){
        // create & show book view
        options = options || {};
        var editBookView = new EditBookView({
            dispatcher: window.dispatcher,
            model: options.book || new window.Book()});
        this.appView.showView(editBookView);
    },

    _loadData: function(){
        // load tags
        window.tagList.fetch();
        fetchConstants();
    }
});
