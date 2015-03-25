/**
 * Main page
 */
define([
    "views/PageView",
    "lib/handlebars",
    "text!views/templates/mainpage.html"
],
function(PageView, Handlebars, template) {
    var loginPage = PageView.extend({
        id: "pageMain",
        _name: "MainPage",
        events: {
            "vclick #main-add-book": "onAddBook",
        },

        initialize: function() {
            this.template = Handlebars.compile(template);
            return this;
        },

        /** EVENTS **/
        /**
         * Handle add book request.
         */
        onAddBook: function(event) {
            event.preventDefault();
            // Trigger login event.
            this.trigger("app:navigate", {
                url: "addbook"
            });
        }
    });

    return loginPage;
});
