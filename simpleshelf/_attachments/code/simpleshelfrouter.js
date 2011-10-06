/**
 * router for simpleshelf
 */
window.SimpleShelfLibrary = Backbone.Router.extend({
    routes: {
        '': 'home'
    },
    
    initialize: function(){
        console.log("initializing SimpleShelfLibrary (Backbone.Router)");
        this.infoView = new LibraryInfoView({
            collection: window.library
        });
        this.tagCloudView = new TagCloudView({
            collection: window.tags
        })
    },
    
    home: function() {
        $('#items').empty();
        $("#items").append(this.infoView.render().el);
        $('#sidebar').append(this.tagCloudView.render().el);
    }
});
