/**
 * Spines by first letter of title view.
 */
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    template = require("./templates/spinesbylettercollapsible.html"),
    spineTemplate = require("./templates/spinelistitem.html");

var SpinesByLetterView = Backbone.View.extend({

    initialize: function(options) {
        this.template = Handlebars.compile(template);
        this.spineTemplate = Handlebars.compile(spineTemplate);
        this.spineCollection = _.has(options, "spineCollection") ? options.spineCollection : null;
        if (!_.isNull(this.spineCollection)) {
            this.listenTo(this.spineCollection, "sync", this.onSpineSync);
        }
        return this;
    },

    render: function() {
        this.$el = $(this.template(this.model.toJSON()));
        return this;
    },

    postRender: function() {
        // Add the spines to the list.
        this._renderList();
        return this;
    },

    _renderList: function() {
        var spines = this.spineCollection.where({firstLetter: this.model.id}),
            $listParent = this.$(".list-group");

        // REFACTOR: create sub-view for spine.
        _.each(spines, function(spine) {
            $listParent.append(this.spineTemplate(spine.toJSON()));
        }, this);
    },

    // EVENTS //
    onSpineSync: function() {
        console.info("[SpinesByLetterView]", "spineCollection synced", this.spineCollection.size());
    }
});

module.exports = SpinesByLetterView;
