/**
 * View an activity (single row).
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    ActivityTemplate = require("./templates/activity.html");

var ActivityView = Backbone.View.extend({
    tagName: "tr",

    initialize: function(options) {
        this.template = Handlebars.compile(ActivityTemplate);
        this.data = options.data;
    },

    render: function() {
        this.$el.html(this.template(this.data));
    }
});

module.exports = ActivityView;
