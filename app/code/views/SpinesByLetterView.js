/**
 * Spines by first letter of title view.
 */
    // "text!views/templates/spinesbylettercollapsible.html",
    // "text!views/templates/spinelistitem.html"
// function(_, Backbone, Handlebars, template, spineTemplate) {
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars");

var SpinesByLetterView = Backbone.View.extend({

    initialize: function(options) {
        this.template = Handlebars.compile(template);
        this.spineTemplate = Handlebars.compile(spineTemplate);
        this.spineCollection = _.has(options, "spineCollection") ? options.spineCollection : null;
        if (!_.isNull(this.spineCollection)) {
            this.listenTo(this.spineCollection, "sync", "onSpineSync");
        }
        return this;
    },

    render: function() {
        this.$el = $(this.template(this.model.toJSON()));
        return this;
    },

    postRender: function() {
        // Turn it into a collapsible widget.
        this.$el.collapsible();
        // Add the spines to the list.
        this._renderList();
        // Turn the content into a listview.
        this.$("ul").listview();
        return this;
    },

    _renderList: function() {
        var spines = this.spineCollection.where({firstLetter: this.model.id}),
            $ul = this.$("ul");

        // REFACTOR: create sub-view for spine.
        _.each(spines, function(spine) {
            $ul.append(this.spineTemplate(spine.toJSON()));
        }, this);
        // Refresh this listview widget.
        // $ul.listview( "refresh" );
    },

    // EVENTS //
    onSpineSync: function() {
        console.info("[SpinesByLetterView]", "spineCollection synced", this.spineCollection.size());
    }
});

module.exports = SpinesByLetterView;
