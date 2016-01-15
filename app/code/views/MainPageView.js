/**
 * Main page
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var mainPage = Backbone.View.extend({
    events: {
        "vclick #main-add-book": "onAddBook",
    },

    initialize: function() {
        this.books = null;
        this._renderedCount = 0;  // Track how many times this was rendered.
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
        try {
            // console.info("[MainPageView]", "# of times rendered", this._renderedCount);
            // Don't choke on this, which only happens on the first render.
            // Subsequent renders need this call because the list always gets emptied & refilled.
            if (this._renderedCount > 0) {
                this.$("#main-reading").listview("refresh");
            }
        } catch(exc) {
            console.error("[MainPageView]", "listview refresh; OK to ignore on 1st load", this._renderedCount);
        }

        this.$("#main-book-instances-fmt").text(this.model.formatSimply("_book_instances"));
        this.$("#main-author-instances-fmt").text(this.model.formatSimply("_author_instances"));
        this.$("#main-tag-instances-fmt").text(this.model.formatSimply("_tag_instances"));

        this._renderedCount++;

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

module.exports = mainPage;
