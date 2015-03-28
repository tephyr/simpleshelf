/**
 * Main page
 */
define([
    "underscore",
    "views/PageView",
    "lib/handlebars",
    "text!views/templates/mainpage.html"
],
function(_, PageView, Handlebars, template) {
    var loginPage = PageView.extend({
        id: "pageMain",
        _name: "MainPage",
        events: {
            "vclick #main-add-book": "onAddBook",
        },

        initialize: function() {
            this.books = null;
            this.template = Handlebars.compile(template);
            // this.listenTo(this.model, "changes", this.render);
            return this;
        },

        postRender: function() {
            // Call superclass first.
            PageView.prototype.postRender.apply(this, arguments);

            if (this.isInDOM) {
                // Show books in "reading" state.
                console.info("Reading count", this.books.size());

                this.$("#main-reading").append(this.books.each(function(book) {
                    return "<li>" + book.get("title") + "</li>";
                }))

                this.$("#main-reading").listview("refresh");
            }

            return this;
        },

        /** EVENTS **/
        /**
         * Handle add book request.
         */
        onAddBook: function(event) {
            event.preventDefault();
            this.trigger("app:navigate", {
                url: "addbook"
            });
        }
    });

    return loginPage;
});
