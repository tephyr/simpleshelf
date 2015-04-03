/**
 * Book page
 */
define([
    "underscore",
    "backbone"
],
function(_, Backbone) {
    var BookPage = Backbone.View.extend({
        events: {},

        render: function() {
            // Fill out existing structure.
            this.$("#book-title").text(this.model.get("title"));
            return this;
        }
    });

    return BookPage;
});
