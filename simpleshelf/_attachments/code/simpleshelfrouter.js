/**
 * router for simpleshelf
 */
window.SimpleShelfLibrary = Backbone.Router.extend({
    routes: {
        '': 'home',
        'tags/:tagName': 'tags',
        'books/:bookId': 'books'
    },
    
    initialize: function(){
        console.log("initializing SimpleShelfLibrary (Backbone.Router)");
        _.bindAll(this, 'home', 'tags', 'books');

        /*this.infoView = new LibraryInfoView({
            collection: window.library
        });*/

        this.navigationView = new NavigationView({});

        this.spineListView = new SpineListView({
            collection: window.spineList
        });

        this.tagCloudView = new TagCloudView({
            collection: window.tagList
        });

        // prep UI objects
        this._profile = $("#profile");
        this._items = $('#items');
        this._sidebar = $('#sidebar');

        // one-time setup
        this._profile.append(this.navigationView.render().el)
    },
    
    home: function() {
        this._items.empty().append(this.spineListView.render().el);
        this.tagCloudView.resetTags();
        this._sidebar
            .empty()
            .append(this.tagCloudView.render().el);
    },

    /**
     * Route for a specific tag
     */
    tags: function(tagName){
        console.log("Routing to tag", tagName);
    },
    
    books: function(bookId){
        console.log('Routing to book', bookId);
        // TODO: setup couchdb's routes & sync w/next line
        // Backbone.history.navigate('./books/' + bookId);
        // clear UI container
        this._items.empty();
        
        var me = this;
        
        // get requested book
        window.book = new Book({id: bookId});
        if (window.book.isNew()){
            me.editBookView = new EditBookView({});
            me._items.append(me.editBookView.render().el);
        } else {
            window.book.fetch({success: function(){
                // create book view
                me.bookView = new BookView({
                    model: window.book
                });
                // append book view to DOM
                me._items.append(me.bookView.render().el);
            }});
        }
    }
});
