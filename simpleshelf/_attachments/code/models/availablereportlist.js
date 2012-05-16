window.AvailableReportList = Backbone.Collection.extend({
    model: AvailableReport,
    url: null,
    initialize: function(options){
        _.bindAll(this, 'selectReport');
        this.bind('availablereport:selected', this.selectReport);
    },

    selectReport: function(reportId){
        console.log('AvailableReportList: selectReport()');
        // find & update selected report
        this.each(function(model){
            model
                .set('selected', (model.get('id') == reportId))
                .trigger('availablereport:highlight', reportId);
        });
    }
});
