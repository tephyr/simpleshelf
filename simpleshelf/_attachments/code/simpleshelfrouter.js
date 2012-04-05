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
        if (authStatus == null || authStatus == 'loggedout'){
            // TODO: if authStatus null, retrieve session before deciding what to do
            // get authenticated
            window.authInfo.set('action', 'login');
            //this.navigate('auth/');
            this.authenticate();
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
    },

    /**
     * Route for authentication
     */
    authenticate: function(options){
        // if we have no auth status, get it
        if (window.authInfo.get('status') == null){
            window.simpleshelf.util.authGetSession(function(results){
                window.dispatcher.trigger('authenticate:processsession', results);
            });
            return;
        }

        if (options){
            // event fired & routed here, follow given actions
            if (options.action == 'login'){
                // login to couch
                var loginOptions = _.extend({
                    'name': null,
                    'password': null,
                    'success': function(response){
                        window.dispatcher.trigger('authenticate:processlogin', response);
                    },
                    'error': function(status, error, reason){
                        window.alert('The login failed with this error: ' + error + '\nand this reason: ' + reason);
                        // leave current view in place, so user can retry
                    }
                }, options);
                window.simpleshelf.util.authLogin(loginOptions);
                return;
            }
        }

        var action = window.authInfo.get('action');
        if (action == null && window.authInfo.get('status') == 'loggedIn'){
            this._loadData();
            window.app.home();
        }

        if (action == 'getcredentials'){
            // show login view
            this.appView.showView(new AuthenticationView({
                dispatcher: window.dispatcher,
                model: window.authInfo
            }));
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
            window.book = new window.Book();
            this._loadEditBookView();
        } else {
            // get requested book
            if (!window.book || (window.book.id != bookId)){
                window.book = new Book({id: bookId});
                window.book.fetch({success: this._loadBookView});
            } else {
                this._loadBookView();
            }
        }
    },
    
    /**
     * Route for editing a specific book
     */
    bookEdit: function(bookId){
        console.log('Routing to edit book', bookId);
        window.book = new Book({id: bookId});
        window.book.fetch({success: this._loadEditBookView});
    },

    _loadBookView: function(){
        // create & show book view
        var bookView = new BookView({
            dispatcher: window.dispatcher,
            model: window.book});
        this.appView.showView(bookView);
    },
    
    _loadEditBookView: function(){
        // create & show book view
        var editBookView = new EditBookView({
            dispatcher: window.dispatcher,
            model: window.book});
        this.appView.showView(editBookView);
    },

    _loadData: function(){
        // load tags
        window.tagList.fetch();
        fetchConstants();
    }
});
