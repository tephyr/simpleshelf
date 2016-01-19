/**
 * Login page
 */
var Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    LoginTemplate = require("./templates/login.html");

var loginPage = Backbone.View.extend({
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
        this.trigger("app:requestLogin", {
            username: this.$("#loginUsername").val(),
            password: this.$("#loginPassword").val()
        });
        // Prevent default action.
        return false;
    }
});

module.exports = loginPage;
