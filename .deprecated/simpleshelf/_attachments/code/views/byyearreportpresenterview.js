/**
 * Container for books-by-year report view
 * Children: SingleYearReportView
 */
window.ByYearReportPresenterView = Backbone.View.extend({
    template: _.template('<h2>Books by year finished</h2><ul id="by-year-report-presenter-view-list"></ul>'),
    tagName: 'div',
    className: 'by-year-report-presenter-view',
    viewName: 'ByYearReportPresenterView',

    events: {
        // 'click #edit': 'editBook'
    },

    initialize: function(options){
        _.bindAll(this, 'addAll', 'addOne', 'onClose', 'render');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.render);
        this.subViews = [];
        this.options.okToLog = true;
    },

    addAll: function() {
        // add years in order
        var availableYears = this.collection.getAvailableYears();
        this.log(this.viewName + '.addAll: this.collection.length==', availableYears.length);
        _.each(availableYears, this.addOne);
    },

    addOne: function(year) {
        var view = new SingleYearReportView({
            dispatcher: this.options.dispatcher,
            collection: this.collection,
            data: {year: year}
        });
        view.render();
        $('ul#by-year-report-presenter-view-list', this.$el).append(view.el);
        this.subViews.push(view);
    },

    onClose: function(){
        _.each(this.subViews, function(view) {
            view.close();
        });
    },

    render: function(){
        this.$el.html(this.template());
        this.addAll();
        return this;
    }
});
