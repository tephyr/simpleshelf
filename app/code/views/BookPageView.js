/**
 * Individual book page view.
 **/
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    BookPageTemplate = require("./templates/bookpage.html");

var BookPageView = Backbone.View.extend({
    id: "bookPage",

    initialize: function() {
        this._template = Handlebars.compile(BookPageTemplate);
        return this;
    },

    /**
     * Render a book model.
     * Ensures that all data needed by the template exists (empty arrays instead of undefined).
     * @return {Object} BookPageView
     */
    render: function() {
        var data = this.model.toJSON();

        // Add hints for template.
        data._multipleAuthors = (this.model.get("authors").length > 1)
        data._activities = data.activities || [];
        // Convert status object into list of objects with identical key/value keys.
        data._statusList = _.map(_.pairs(data.status || []), function(pair) {
            return {statusKey: pair[0], statusValue: pair[1]};
        });
        data._tags = data.tags || [];

        this.$el.html(this._template(data));
        return this;
    }
});

module.exports = BookPageView;
