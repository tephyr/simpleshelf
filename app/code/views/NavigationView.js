/**
 * Navigation bar view.
 */
import {_, Backbone, Handlebars} from 'DefaultImports';
import {Hub} from 'Hub';
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
        let currentMenuSelector;
        switch(eventData.route) {
            case 'books':
            case 'authors':
            case 'tags':
                currentMenuSelector = `.menu-item-${eventData.route}`;
                break;
        }

        this.setHomeView(eventData.route === 'main');
        this.$('#navbarNav .nav-item').not(currentMenuSelector).removeClass('active');
        this.$(`#navbarNav .nav-item${currentMenuSelector}`).addClass('active');
    }
});

export {NavigationView};
