/**
 * router for simpleshelf
 */
window.SimpleShelfLibrary = Backbone.Router.extend({
    routes: {
        '': 'home',
        'tags/:tagName': 'tags',
        'books/:bookId': 'books'
    },
    
    initialize: function(options){
        console.log("initializing SimpleShelfLibrary (Backbone.Router)");
        _.bindAll(this, 'home', 'tags', 'books');
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
    books: function(bookId){
        console.log('Routing to book', bookId);
        // TODO: setup couchdb's routes & sync w/next line
        // Backbone.history.navigate('./books/' + bookId);
        
        var me = this;
        
        if (bookId == null){
            // new book
            window.book = new window.Book();
            var editBookView = new EditBookView({
                dispatcher: window.dispatcher,
                model: window.book});
            this.appView.showView(editBookView);
        } else {
            // get requested book
            var loadBookView = function(){
                // create & show book view
                var bookView = new BookView({
                    dispatcher: window.dispatcher,
                    model: window.book});
                me.appView.showView(bookView);
            }
            if (!window.book || (window.book.id != bookId)){
                window.book = new Book({id: bookId});
                window.book.fetch({success: loadBookView});
            } else {
                loadBookView();
            }
        }
    }
});
