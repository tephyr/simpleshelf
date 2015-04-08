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
            var fieldsStandardText = ["title", "isbn", "publisher", "notesPublic", "notesPrivate"],
                authors;

            _.each(fieldsStandardText, function(field) {
                this.$("#book-" + field).html(this.model.get(field));
            }, this);

            // Show either author or authors rows.
            authors = this.model.get("authors");
            if (!_.isArray(authors) || authors.length === 0) {
                // Hide both.
                this.$(".author, .authors").hide();
            } else {
                // REFACTOR: use just one line, if simply using text for multiple authors.
                if (authors.length === 1) {
                    this.$(".authors").hide();
                    this.$(".author").show();
                    this.$(".author.ui-block-b div").html(authors[0]);
                } else {
                    this.$(".author").hide();
                    this.$(".authors").show();
                    this.$(".authors.ui-block-b div").html(authors.join(", "));
                }
            }

            // Private?
            this.$("#book-public").html(
                this.model.get("public") ? "Yes" : "No"
            );

            return this;
        }
    });

    return BookPage;
});
