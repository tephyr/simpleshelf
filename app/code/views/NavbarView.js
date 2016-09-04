/**
 * Navigation bar view.
 */
var Backbone = require("backbone"),
    _ = require('underscore'),
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

    /** CUSTOM FUNCTIONS **/

    /**
     * Modify this view when on home page.
     * @param {Object} data {home: bool}
     */
    setHomeView: function(data) {
        if (_.has(data, 'home') && data.home) {
            this.$el.removeClass('home');
        } else {
            this.$el.addClass('home');
        }
    },

    /** EVENTS **/
    onClickHome: function(event) {
        // TODO: here for testing; currently a noop.
    }
});

module.exports = navigationView;
