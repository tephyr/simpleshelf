/**
 * Show report list
 */
window.AvailableReportListView = Backbone.View.extend({
    className: 'availablereportlist',
    tagName: 'div',
    template: _.template('<h2 class="availablereports"><a href="#" id="availablereportlistheader">Reports</a></h2><ul></ul>'),
    events: {
    },
    viewName: 'AvailableReportListView',

    initialize: function(properties) {
        _.bindAll(this, 'render', 'addAll', 'addOne', 'reportSelected');
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.render);
    },

    render: function() {
        this.log('rendering ' + this.viewName);
        if (this.collection.length){
            this.$el.html(this.template());
            this.addAll();
        } else {
            this.$el.empty();
        }
        return this;
    },

    addAll: function() {
        this.log(this.viewName + '.addAll: this.collection.length==', this.collection.length);
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        var view = new AvailableReportView({
            dispatcher: this.options.dispatcher,
            model: model,
            okToLog: this.okToLog
        });
        view.render();
        $('ul', this.$el).append(view.el);
        model.bind('remove', view.remove);
        view.bind('availablereportview:selected', this.reportSelected);
    },

    reportSelected: function(reportId){
        this.log(this.viewName + '.reportSelected event', reportId);
        this.options.dispatcher.trigger('availablereportlistview:reportselected', reportId);
    }
});
