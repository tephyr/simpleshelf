/**
 * Simple representation of book
 */
window.SpineView = Backbone.View.extend({
    className: 'spine-view',
    tagName: 'li',
    template: _.template('<span class="spine"><a href="./{{id}}">{{title}}</a></span> <span class="del"><a href="#">delete</a></span>'),
    events: {
      'click .spine a': 'bookSelected',
      'click .del a': 'bookRequestedDelete'
    },
    viewName: 'SpineView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove', 'bookSelected', 'bookRequestedDelete');
        this.model.on('change', this.render);
        this.model.on('destroy', this.remove);
        this.options.okToLog = true;
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    onClose: function(){
        this.model.off('change', this.render);
        this.model.off('destroy', this.remove);
    },

    remove: function() {
        $(this.el).remove();
    },

    bookRequestedDelete: function(evt){
        this.log("SpineView: deleted book", this.options.model);
        evt.preventDefault();
        // verify!
        if (window.confirm("Ok to delete \"" + this.options.model.get("title") + "\"?")){
            this.model.destroy({'wait': true});
        }
    },

    bookSelected: function(evt){
        this.log('SpineView: selected book', this.options.model);
        evt.preventDefault();
        // signal to switch to full view for this book
        this.model.select();
        this.trigger('spineview:selected', {'bookId': this.model.get('id')});
    }
});
