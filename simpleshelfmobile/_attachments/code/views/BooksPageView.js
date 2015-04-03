/**
 * Books page
 */
define([
    "underscore",
    "backbone",
    "views/SpinesByLetterView"
],
function(_, Backbone, SpinesByLetterView) {
    var BooksPage = Backbone.View.extend({
        events: {},

        initialize: function(options) {
            this.$collapsibleParent = this.$("[role='main']");
            // Hold spine collection to pass to child views.
            this.spineCollection = _.has(options, "spineCollection") ? options.spineCollection : null;
            // EVENTS //
            // Render when the books_by_letter data syncs.
            this.listenTo(this.collection, "sync", this.render);
            this.listenTo(this.collection, "reset", this.onCollectionReset);
            return this;
        },

        render: function() {
            this.collection.each(this.addOne, this);
            return this;
        },

        addOne: function(model) {
            var view = new SpinesByLetterView({
                model: model,
                spineCollection: this.spineCollection
            });
            view.render();
            this.$collapsibleParent.append(view.$el);
            view.postRender();
            model.on("remove", view.remove, view);
        },

        onCollectionReset: function() {
            console.info("[BooksPageView]", "collection was reset");
        }
    });

    return BooksPage;
});
