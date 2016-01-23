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

    render: function() {
        var data = this.model.toJSON();

        // Add hints for template.
        data._multipleAuthors = (this.model.get("authors").length > 1)
        // Convert status object into list of objects with identical key/value keys.
        data._statusList = _.map(_.pairs(this.model.get("status")), function(pair) {
            return {statusKey: pair[0], statusValue: pair[1]};
        });

        this.$el.html(this._template(data));
        return this;
    }
});

module.exports = BookPageView;
