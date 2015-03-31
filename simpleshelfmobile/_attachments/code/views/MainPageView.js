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
            var currentlyReadingCount = this.books.size();
            console.info("Reading count", currentlyReadingCount);

            this.$("#main-reading-count").text(currentlyReadingCount);

            if (currentlyReadingCount > 0) {
                this.$("#main-reading").empty().append(this.books.map(function(book) {
                    return "<li>" + book.get("title") + "</li>";
                }));
            } else {
                this.$("#main-reading").empty().append("<li>Currently reading no books.</li>");
            }

            this.$("#main-book-instances-fmt").text(this.model.formatSimply("_book_instances"));
            this.$("#main-author-instances-fmt").text(this.model.formatSimply("_author_instances"));
            this.$("#main-tag-instances-fmt").text(this.model.formatSimply("_tag_instances"));

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
