/**
 * Book page
 */
define([
    "underscore",
    "backbone"
],
function(_, Backbone) {
    var BookPage = Backbone.View.extend({
        render: function() {
            // Fill out existing structure.
            var fieldsStandardText = ["title", "isbn", "publisher", "notesPublic", "notesPrivate"];
            _.each(fieldsStandardText, function(field) {
                this.$("#book-" + field).html(this.model.get(field));
            }, this);

            return this;
        }
    });

    return BookPage;
});
