/**
 * Main page view.
 **/
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    MainPageTemplate = require("./templates/mainpage.html");

var mainPage = Backbone.View.extend({
    id: "mainPage",
    events: {
        "vclick #main-add-book": "onAddBook",
    },

    initialize: function(options) {
        this.books = null;
        this.readingStats = options.readingStats;
        this._template = Handlebars.compile(MainPageTemplate);
        return this;
    },

    render: function() {
        var basicData = {
            currentlyReadingCount: this.books.size(),
            currentBooks: this.books.map(function(book) {
                return {id: book.get("_id"), title: book.get("title")};
            }),
            bookCount: this.model.formatSimply("_book_instances"),
            authorCount: this.model.formatSimply("_author_instances"),
            tagCount: this.model.formatSimply("_tag_instances"),
            avgReadingTime: this.readingStats.get("avg") || "N/A"
        };

        this.$el.html(this._template(basicData));

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
