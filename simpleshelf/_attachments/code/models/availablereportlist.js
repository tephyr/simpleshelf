window.AvailableReportList = Backbone.Collection.extend({
    model: AvailableReport,
    url: null,
    initialize: function(options){
        _.bindAll(this, 'getCurrentReport', 'selectReport');
        this.bind('availablereport:selected', this.selectReport);
    },

    /**
     * Get currently selected report, or null
     */
    getCurrentReport: function(){
        var currentReport = null;
        currentReport = this.find(function(model){
            return model.get('selected');
        });
        return currentReport;
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
