window.ReportList = Backbone.Collection.extend({
    model: Report,
    url: null,
    initialize: function(options){
        _.bindAll(this, 'selectReport');
        this.bind('report:selected', this.selectReport);
    },

    selectReport: function(reportId){
        console.log('ReportList: selectReport()');
        // find & update selected report
        this.each(function(model){
            model
                .set('selected', (model.get('id') == reportId))
                .trigger('report:highlight', reportId);
        });
    }
});
