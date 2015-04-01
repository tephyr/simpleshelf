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

        initialize: function() {
            this.$collapsibleParent = this.$("[role='main']");
            this.spineCollection = null;
            return this;
        },

        render: function() {
            this.collection.each(this.addOne, this);
        },

        addOne: function(model) {
            var view = new SpinesByLetterView({
                model: model,
                spineCollection: this.spineCollection
            });
            view.render();
            this.$collapsibleParent.append(view.$el);
            view.postRender();
            model.on("remove", view.remove);
        }
    });

    return BooksPage;
});
