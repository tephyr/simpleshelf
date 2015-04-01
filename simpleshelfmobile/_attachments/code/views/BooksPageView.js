/**
 * Books page
 */
define([
    "underscore",
    "backbone",
    "handlebars",
    "text!views/templates/titlecollapsible.html"
],
function(_, Backbone, Handlebars, template) {
    var BooksPage = Backbone.View.extend({
        events: {},

        initialize: function() {
            this.template = Handlebars.compile(template);
            return this;
        },

        render: function() {
            var $collapsibleParent = this.$("[role='main']"),
                $letter;
            // REFACTOR: turn into sub-views.
            this.collection.each(function(model) {
                $letter = $(this.template(model.toJSON()));
                $collapsibleParent.append($letter);
                $letter.collapsible();
            }, this);
        }
    });

    return BooksPage;
});
