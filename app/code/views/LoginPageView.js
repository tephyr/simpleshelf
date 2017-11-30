/**
 * Login page
 */
import {Backbone} from 'DefaultImports';
import * as Handlebars from 'handlebars';
import LoginTemplate from './templates/login.html';
import {Hub} from 'Hub'

const LoginPageView = Backbone.View.extend({
    id: "loginPage",
    events: {
        "submit .login-form": "onLogin"
    },

    initialize: function() {
        this._template = Handlebars.compile(LoginTemplate);
    },

    render: function() {
        this.$el.html(this._template());
        return this;
    },

    /** EVENTS **/
    /**
     * Handle log in.
     */
    onLogin: function(event) {
        // Trigger login event.
        Hub.trigger("app:requestlogin", {
            username: this.$("#loginUsername").val(),
            password: this.$("#loginPassword").val()
        });
        // Prevent default action.
        return false;
    }
});

export {LoginPageView};
