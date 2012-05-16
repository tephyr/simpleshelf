/**
 * AvailableReport: a model for available reports, with optional filter
 * NOTE: Multiple reports can share the same name (but must have different filters),
 * so id distinguishes between them.
 */
window.AvailableReport = Backbone.Model.extend({
    defaults: {
        'dbView': '',     // name of couchdb view
        'title': '',      // human-readable
        'selected': false // is this view currently selected?
    },

    select: function(){
        console.log('AvailableReport.select: called for report ' + this.get('title'));
        this.collection.trigger('availablereport:selected', this.id);
    }
});
