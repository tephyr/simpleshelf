/**
 * Navigation bar view.
 */
var Backbone = require("backbone"),
    _ = require('underscore'),
    Handlebars = require("handlebars"),
    NavbarTemplate = require("./templates/navbar.html");

import {Hub} from 'Hub';

var navigationView = Backbone.View.extend({
    id: "navigationView",
    events: {
        "click #navbarBrand": "onClickHome"
    },

    initialize: function() {
        this._template = Handlebars.compile(NavbarTemplate);
        this.listenTo(Hub, 'routechanged', this.onRouteChange);
    },

    render: function() {
        this.$el.html(this._template());
        return this;
    },

    /** CUSTOM FUNCTIONS **/

    /**
     * Modify this view when on home page.
     * @param {Bool} isHome true to show home view
     */
    setHomeView: function(isHome) {
        if (!isHome) {
            this.$el.removeClass('home');
        } else {
            this.$el.addClass('home');
        }
    },

    /** EVENTS **/
    onClickHome: function(event) {
        // TODO: here for testing; currently a noop.
    },

    onRouteChange: function(eventData={}) {
        this.setHomeView(eventData.route === 'main');
    }
});

module.exports = navigationView;
