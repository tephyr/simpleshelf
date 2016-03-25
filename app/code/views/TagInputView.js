/**
 * Show and edit tags.
 * Tabbing issue on Firefox: https://github.com/selectize/selectize.js/issues/396; fix has languished
 * as PR since 2015-02-20.
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    Selectize = require("selectize"),
    TagInputTemplate = require("./templates/taginput.html");

var TagInputView = Backbone.View.extend({
    _logHeader: "[TagInputView]",
    tagName: "div",

    initialize: function(options) {
        this.template = Handlebars.compile(TagInputTemplate);
        this.configuration = options.configuration || {};
        this.tagCollection = options.tagCollection || null;
    },

    render: function() {
        this.$el.html(this.template());
        this.$("#simpleshelf-tag-input").selectize({
            options: this.tagCollection.map(function(tag) {
                return {"value": tag.id, "text": tag.id};
            }),
            items: _.isObject(this.model) ? this.model.get("tags") : [],
            delimiter: ",",
            hideSelected: true,
            create: true,
            onFocus: function() {
                console.info("selectize", "onFocus()");
            },
            onChange: _.bind(this.onTagChange, this),
        });
        console.info(this._logHeader, "selectize ready?");
    },

    /* EVENTS */
    onTagChange: function(value) {
        console.info("selectize", "onChange()", value, value.split(","));
        this.model.set("tags", value.split(","));
    }
});

module.exports = TagInputView;
