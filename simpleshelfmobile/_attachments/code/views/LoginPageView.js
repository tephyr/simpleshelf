/**
 * Login page
 */
define([
    "views/PageView",
    "lib/handlebars",
    "text!views/templates/loginpage.html"
],
function(PageView, Handlebars, template) {
    var loginPage = PageView.extend({
        id: "pageLogin",
        _name: "LoginPage",
        events: {
            "vclick #login-action": "onLogin",
        },

        initialize: function() {
            this.template = Handlebars.compile(template);
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

    return loginPage;
});
