/**
 * Spines by first letter of title view.
 */
define([
    "underscore",
    "backbone",
    "handlebars",
    "text!views/templates/spinesbylettercollapsible.html"
],
function(_, Backbone, Handlebars, template) {
    var SpinesByLetterView = Backbone.View.extend({
        events: {},

        initialize: function() {
            this.template = Handlebars.compile(template);
            return this;
        },

        render: function() {
            this.$el = $(this.template(this.model.toJSON()));
        },

        postRender: function() {
            this.$el.collapsible();
            this.$el.on("collapsibleexpand", _.bind(this.onCollapsibleExpand, this));
        },

        // EVENTS //
        onCollapsibleExpand: function(event, ui) {
            console.info("[SpinesByLetterView]", "onCollapsibleExpand", this.model.id);
            // Trigger load/refresh (if necessary) of SpineCollection *for given letter*.
            // Fill this collapsible's <ul> with spines.
        }
    });

    return SpinesByLetterView;
});
