/**
 * Individual book page view.
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    BookPageTemplate = require("./templates/bookpage.html"),
    ActivitiesView = require("./ActivitiesView.js");

var BookPageView = Backbone.View.extend({
    id: "bookPage",

    initialize: function(options) {
        this._template = Handlebars.compile(BookPageTemplate);
        this.configuration = options.configuration || {};
        return this;
    },

    /**
     * Render a book model.
     * Ensures that all data needed by the template exists (empty arrays instead of undefined).
     * @return {Object} BookPageView
     */
    render: function() {
        var data = this.model.toJSON(),
            self = this;

        // Add hints for template.
        data._multipleAuthors = (this.model.get("authors").length > 1)
        // Convert status object into list of objects with identical key/value keys.
        data._statusList = _.map(_.pairs(data.status || []), function(pair) {
            return {statusKey: pair[0], statusValue: self.configuration.getText(pair[1])};
        });
        data._tags = data.tags || [];

        this.$el.html(this._template(data));

        this.addActivitiesView(this.model);

        return this;
    },

    /**
     * Add the Activities sub-view.
     * @param {Object} model SpineCollection model
     */
    addActivitiesView: function(model) {
        var view = new ActivitiesView({
            model: model,
            configuration: this.configuration
        });
        view.render();
        this.$(".activitiesViewContainer").append(view.$el);
        model.on("remove", view.remove, view);
    }
});

module.exports = BookPageView;
