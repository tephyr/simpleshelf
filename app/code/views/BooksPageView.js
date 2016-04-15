/**
 * Books page
 */
var Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    SpinesByLetterView = require("./SpinesByLetterView.js"),
    BooksPageTemplate = require("./templates/bookspage.html");

var BooksPage = Backbone.View.extend({
    id: "booksPage",
    _logHeader: "[BooksPageView]",

    initialize: function(options) {
        // Names of collections that are ready to be rendered.
        this._collectionsReady = {
            "collection": false,
            "spineCollection": false
        };

        this.template = Handlebars.compile(BooksPageTemplate);

        // Hold spine collection to pass to child views.
        this.spineCollection = options.spineCollection;

        // EVENTS //
        // Render when the books_by_letter data syncs.
        // var signalCollectionFn = _.bind(function() {
        //     console.info(this._logHeader, "collection.sync (via signalCollectionFn)");
        //     this.renderIfReady("collection");
        // }, this);
        // var signalSpineCollectionFn = _.bind(function() {
        //     console.info(this._logHeader, "collection.sync (via signalSpineCollectionFn)");
        //     this.renderIfReady("spineCollection");
        // }, this);

        // this.listenTo(this.collection, "sync", signalCollectionFn);
        // this.listenTo(this.collection, "reset", this.onCollectionReset);
        // this.listenTo(this.spineCollection, "sync", signalSpineCollectionFn);
        return this;
    },

    /**
     * Override View.remove().
     * @param  {Object} attributes 
     * @param  {Object} options    
     * @return {Object}            this
     */
    remove: function(attributes, options) {
        /* jshint unused: false */
        console.info(this._logHeader, "remove");
        this._collectionsReady.collection = false;
        this._collectionsReady.spineCollection = false;
        Backbone.View.prototype.remove.apply(this, arguments);
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
        view.listenTo(model, "remove", view.remove);
    },

    onCollectionReset: function() {
        console.info(this._logHeader, "collection was reset");
    },

    /**
     * Render only if both collections have signalled "sync".
     **/
    renderIfReady: function(name) {
        this._collectionsReady[name] = true;
        console.info(this._logHeader, "renderIfReady", this._collectionsReady,
            "ready to render", name);
        if (this._collectionsReady.collection &&
            this._collectionsReady.spineCollection) {
            // Render the page & subviews.
            this.render();
        }
    }
});

module.exports = BooksPage;
