/**
 * Container for SpineViews of books for a single year
 */
window.SingleYearReportView = window.SpineListView.extend({
    template: _.template('<h2>{{ year }}</h2><ul></ul>'),
    className: 'single-year-report-view',
    viewName: 'SingleYearReportView',

    initialize: function(options){
        SpineListView.prototype.initialize.call(this, options);
        this.options = options;
    },

    render: function(){
        this.$el.html(this.template({'year': this.options.data.year}));
        this.addAll();
        return this;
    },

    addAll: function() {
        this.log(this.viewName + '.addAll: year==', this.options.data.year);
        _.each(this.collection.getSpinesByYear(this.options.data.year), this.addOne);
    }
});
