/**
 * Navigation bar view.
 */
var Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    NavbarTemplate = require("./templates/navbar.html");

var navigationView = Backbone.View.extend({
    id: "navigationView",
    events: {
        "click #navbarBrand": "onClickHome"
    },

    initialize: function() {
        this._template = Handlebars.compile(NavbarTemplate);
    },

    render: function() {
        this.$el.html(this._template());
        return this;
    },

    /** EVENTS **/
    onClickHome: function(event) {
        // TODO: here for testing; currently a noop.
    }
});

module.exports = navigationView;
