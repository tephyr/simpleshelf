/**
 * Container for simple list of titles
 */
window.SpineListView = Backbone.View.extend({
    template: _.template('<h2>All books</h2><ul></ul>'),
    tagName: 'div',
    className: 'spine-list-view',
    viewName: 'SpineListView',

    initialize: function(options){
        _.bindAll(this, 'render',
            'addAll', 'addOne', 'bookSelected',
            'updateTag');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.render);
        this.options.okToLog = true;
    },

    render: function(){
        this.log('rendering window.SpineListView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    onClose: function(){
        this.collection.off('add', this.addOne);
        this.collection.off('reset', this.render);
    },

    addAll: function() {
        this.log('SpineListView.addAll: this.collection.length==', this.collection.length);
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        // TODO: hold in array for onClose clean-up
        var view = new SpineView({
            dispatcher: this.options.dispatcher,
            model: model
        });
        view.render();
        $('ul', this.el).append(view.el);
        model.on('remove', view.remove);
        // even though the subview is given the dispatcher reference,
        // its events should still bubble up to the parent view, which
        // will handle dispatching them globally
        view.on('spineview:selected', this.bookSelected);
    },

    updateTag: function(msgArgs){
        this.log('SpineListView:updateTag', msgArgs);
        this.collection.filterByTag(msgArgs);
    },

    bookSelected: function(msgArgs){
        this.log('SpineListView:bookSelected', msgArgs);
        this.collection.setCurrentSpine({'id': msgArgs.bookId});
        this.options.dispatcher.trigger('spinelistview:bookSelected', msgArgs.bookId);
    }
});
