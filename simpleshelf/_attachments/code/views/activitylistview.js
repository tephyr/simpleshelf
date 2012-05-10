/**
 * ActivityListView: subview on BookView for all Activities
 */
window.ActivityListView = Backbone.View.extend({
    className: 'activity-list-view',
    tagName: 'table',
    template: _.template(
        '<tbody/>'
    ),
    viewName: "ActivityListView",

    events: {},
    initialize: function(){
        _.bindAll(this, 'render', 'addAll', 'addOne');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.render);
    },
    render: function() {
        this.log('rendering window.ActivityListView');
        $(this.el).html(this.template());
        this.addAll();
        return this;
    },

    onClose: function(){
        this.collection.off('add', this.addOne);
        this.collection.off('reset', this.render);
    },

    addAll: function() {
        this.log('ActivityListView.addAll: this.collection.length==', this.collection.length);
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        // TODO: hold in array for onClose clean-up
        var view = new ActivityView({
            dispatcher: this.options.dispatcher,
            model: model
        });
        view.render();
        $('tbody', this.el).append(view.el);
        model.on('remove', view.remove);
        // even though the subview is given the dispatcher reference,
        // its events should still bubble up to the parent view, which
        // will handle dispatching them globally
        view.on('activityview:selected', function(){window.alert("activity view selected");});
    }
});
