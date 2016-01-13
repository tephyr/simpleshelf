/**
 * Login page
 */
define([
    "backbone"
],
function(Backbone) {
    var loginPage = Backbone.View.extend({
        id: "login",
        events: {
            "vclick #login-action": "onLogin"
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
