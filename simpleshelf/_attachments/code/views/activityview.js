window.ActivityView = Backbone.View.extend({
    className: 'activity-view',
    tagName: "tr",
    template: _.template(
        "<td>{{date}}</td><td>{{action}}</td>"
    ),
    viewName: 'ActivityView',

    initialize: function(properties){
        _.bindAll(this, 'render', 'remove');
        this.model.on('change', this.render);
        this.model.on('destroy', this.remove);
    },

    render: function(){
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});
