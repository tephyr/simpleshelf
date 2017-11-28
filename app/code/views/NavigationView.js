/**
 * Navigation bar view.
 */
import {_, Backbone} from 'DefaultImports';
import {Hub} from 'Hub';
import * as Handlebars from 'handlebars';
import NavbarTemplate from './templates/navbar.html';

const NavigationView = Backbone.View.extend({
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

export {NavigationView};
