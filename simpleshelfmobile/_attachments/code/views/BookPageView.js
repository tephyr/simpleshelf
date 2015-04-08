/**
 * Book page
 */
define([
    "underscore",
    "backbone",
    "handlebars",
    "text!views/templates/bookactivities.html"
],
function(_, Backbone, Handlebars, ActivitiesTemplate) {
    var BookPage = Backbone.View.extend({
        render: function() {
            // Fill out existing structure.
            var fieldsStandardText = ["title", "isbn", "publisher", "notesPublic", "notesPrivate"],
                authors, fieldValue, activities, $ulActivities, template;

            _.each(fieldsStandardText, function(field) {
                // Use non-breaking space when field is null.
                if (this.model.has(field) && this.model.get(field).length > 0) {
                    fieldValue = this.model.get(field);
                } else {
                    fieldValue = "&nbsp;";
                }
                this.$("#book-" + field).html(fieldValue);
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

            // List of activities.
            activities = this.model.get("activities");
            if (activities.length === 0) {
                 this.$("#book-activities").empty().html("&nbsp;");
            } else {
                this.$("#book-activities").empty().append("<ul>");
                $ulActivities = this.$("#book-activities ul");
                template = Handlebars.compile(ActivitiesTemplate);
                _.each(activities, function(activity) {
                    $ulActivities.append(template(activity));
                }, this);
            }

            return this;
        }
    });

    return BookPage;
});
