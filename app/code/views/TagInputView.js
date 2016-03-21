/**
 * Show and edit tags.
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
        this.data = options.data || {}; // {current: [], available: []}
        this.configuration = options.configuration || {};
        this.tagCollection = options.tagCollection || null;
    },

    render: function() {
        this.$el.html(this.template(this.data));
        this.$("#simpleshelf-tag-input").selectize({
            // items: [
            //     "y"
            // ],
            // labelField: "name",
            // valueField: "id",
            options: this.tagCollection.map(function(tag) {
                return {"value": tag.id, "text": tag.id};
            }),
            delimiter: ",",
            hideSelected: true,
            create: true,
            onInitialize: function() {
                console.info("selectize", "onInitialize()");
            },
            onFocus: function() {
                console.info("selectize", "onFocus()");
            },
            onChange: function(value) {
                console.info("selectize", "onChange()", value);
            },
            onDropdownOpen: function($dropdown) {
                console.info("selectize", "onDropdownOpen()", $dropdown);
            }
        });
        console.info(this._logHeader, "selectize ready?");
    }
});

module.exports = TagInputView;
