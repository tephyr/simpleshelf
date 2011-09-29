/**
 * Views for simpleshelf
 */

/**
 * Show basic info about entire library; based on Library [collection]
 */
var LibraryInfoView = Backbone.View.extend({
    template: "#info-template",
    tag: "div",
    className: "info-view",
    
    initialize: function(){
        _.bindAll(this, "render");
        this.initializeTemplate();
        this.collection.bind('reset', this.render);
    },
    
    initializeTemplate: function() {
        this.template = _.template($(this.template).html());
    },

    render: function() {
        $(this.el).html(this.template({bookCount: this.collection.length}));
        return this;
    }
});
