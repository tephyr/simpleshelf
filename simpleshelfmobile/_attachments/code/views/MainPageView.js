/**
 * Main page
 */
define([
    "underscore",
    "backbone"
],
function(_, Backbone, Handlebars, template) {
    var mainPage = Backbone.View.extend({
        events: {
            "vclick #main-add-book": "onAddBook",
        },

        initialize: function() {
            this.books = null;
            return this;
        },

        render: function() {
            // Show books in "reading" state.
            console.info("Reading count", this.books.size());

            this.$("#main-reading-count").text(this.books.size());
            this.$("#main-book-instances-fmt").text(this.model.formatSimply("_book_instances"));
            this.$("#main-author-instances-fmt").text(this.model.formatSimply("_author_instances"));
            this.$("#main-tag-instances-fmt").text(this.model.formatSimply("_tag_instances"));

            this.$("#main-reading").append(this.books.map(function(book) {
                return "<li>" + book.get("title") + "</li>";
            }));

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

    return mainPage;
});
