/**
 * Report: a model that returns SpineList-compatible results, with optional filter
 * NOTE: Multiple reports can share the same name (but must have different filters),
 * so id distinguishes between them.
 */
window.Report = Backbone.Model.extend({
    defaults: {
        'dbView': '',     // name of couchdb view
        'title': '',      // human-readable
        'selected': false // is this view currently selected?
    },

    select: function(){
        console.log('Report.select: called for report ' + this.get('title'));
        this.collection.trigger('report:selected', this.id);
    }
});
