/**
 * Books page
 */
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    SpinesByLetterView = require("./SpinesByLetterView.js"),
    BooksPageTemplate = require("./templates/bookspage.html");

var BooksPage = Backbone.View.extend({
    id: "booksPage",
    initialize: function(options) {
        // Names of collections that are ready to be rendered.
        this._collectionsReady = {
            "collection": false,
            "spineCollection": false
        };

        this.template = Handlebars.compile(BooksPageTemplate);

        // Hold spine collection to pass to child views.
        this.spineCollection = _.has(options, "spineCollection") ? options.spineCollection : null;

        // EVENTS //
        // Render when the books_by_letter data syncs.
        this.listenTo(this.collection, "sync", function() {this.renderIfReady("collection");});
        if (!_.isNull(this.spineCollection)) {
            this.listenTo(this.spineCollection, "sync",
                function() {this.renderIfReady("spineCollection");}
            );
        }
        this.listenTo(this.collection, "reset", this.onCollectionReset);
        return this;
    },

    render: function() {
        // Render this view.
        this.$el.html(this.template());
        // Render all sub-views.
        this.collection.each(this.addOne, this);
        return this;
    },

    /**
     * Add a single sub-view.
     * @param {Object} model SpineCollection model
     */
    addOne: function(model) {
        var view = new SpinesByLetterView({
            model: model,
            spineCollection: this.spineCollection
        });
        view.render();
        this.$("#booksData").append(view.$el);
        view.postRender();
        model.on("remove", view.remove, view);
    },

    onCollectionReset: function() {
        console.info("[BooksPageView]", "collection was reset");
    },

    /**
     * Render only if both collections have signalled "sync".
     **/
    renderIfReady: function(name) {
        console.info("[BooksPageView]", "ready to render", name);
        this._collectionsReady[name] = true;
        if (this._collectionsReady.collection === true &&
            this._collectionsReady.spineCollection === true) {
            // Render the page & subviews.
            this.render();
        }
    }
});

module.exports = BooksPage;
