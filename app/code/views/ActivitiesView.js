/**
 * View all activities for a book.
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    ActivitiesTemplate = require("./templates/activities.html"),
    ActivityView = require("./ActivityView.js");

var ActivitiesView = Backbone.View.extend({
    initialize: function(options) {
        this.template = Handlebars.compile(ActivitiesTemplate);
        this.configuration = options.configuration || {};
    },

    render: function() {
        this.$el.html(this.template());

        // Load each row as separate sub-view.
        _.each(this.model.get("activities"), function(activity) {
            this.addOne(activity);
        }, this);
    },

    addOne: function(activity) {
        var view = new ActivityView({
            data: activity,
            configuration: this.configuration
        });
        view.render();
        this.$("table > tbody").append(view.$el);
        this.model.on("remove", view.remove, view);
    }
});

module.exports = ActivitiesView;
