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

        initialize: function(options) {
            this.template = Handlebars.compile(template);
            this.spineCollection = _.has(options, "spineCollection") ? options.spineCollection : null;
            return this;
        },

        render: function() {
            this.$el = $(this.template(this.model.toJSON()));
            return this;
        },

        postRender: function() {
            // Turn it into a collapsible widget.
            this.$el.collapsible();
            this.$el.on("collapsibleexpand", _.bind(this.onCollapsibleExpand, this));
            // Turn the content into a listview.
            this.$("ul").listview();
            return this;
        },

        // EVENTS //
        onCollapsibleExpand: function(event, ui) {
            console.info("[SpinesByLetterView]", "onCollapsibleExpand", this.model.id);
            // Trigger load/refresh (if necessary) of SpineCollection *for given letter*.
            // Fill this collapsible's <ul> with spines.
            var spines = this.spineCollection.where({firstLetter: this.model.id});
            var $ul = this.$("ul");

            // REFACTOR: create sub-view for spine.
            $ul.empty();
            _.each(spines, function(spine) {
                $ul.append("<li title='" + spine.id + "'>" + spine.get("title") + "</li>");
            }, this);
            // Refresh this listview widget.
            $ul.listview( "refresh" );
        }
    });

    return SpinesByLetterView;
});
