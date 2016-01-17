/**
 * Login page
 */
var Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    LoginTemplate = require("./templates/login.html");

var loginPage = Backbone.View.extend({
    id: "login",
    events: {
        "click #login-action": "onLogin"
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
            username: this.$("#login-username").val(),
            password: this.$("#login-password").val()
        });
    }
});

module.exports = loginPage;
