/**
 * router for simpleshelf
 */
window.SimpleShelfLibrary = Backbone.Router.extend({
    routes: {
        '': 'home'
    },
    
    initialize: function(){
        console.log("initializing SimpleShelfLibrary (Backbone.Router)");

        /*this.infoView = new LibraryInfoView({
            collection: window.library
        });*/

        this.spineListView = new SpineListView({
            collection: window.spineList
        });

        this.tagCloudView = new TagCloudView({
            collection: window.tagList
        });
    },
    
    home: function() {
        $('#items').empty();
        $("#items").append(this.spineListView.render().el);
        $('#sidebar').append(this.tagCloudView.render().el);
    }
});
