/**
 * Book page
 */
define([
    "underscore",
    "jquery",
    "backbone",
    "handlebars",
    "text!views/templates/bookactivities.html"
],
function(_, $, Backbone, Handlebars, ActivitiesTemplate) {
    var BookPage = Backbone.View.extend({
        render: function() {
            // Fill out existing structure.
            var fieldsStandardText = ["title", "isbn", "publisher", "notesPublic", "notesPrivate"],
                authors, fieldValue, activities, $ul, template, statuses;

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
                $ul = this.$("#book-activities ul");
                template = Handlebars.compile(ActivitiesTemplate);
                _.each(activities, function(activity) {
                    $ul.append(template(activity));
                }, this);
            }

            // List of statuses.
            statuses = this.model.get("status");
            if (!_.isObject(statuses)) {
                this.$("#book-status").empty().html("&nbsp;");
            } else {
                this.$("#book-status").empty().append("<ul>");
                $ul = this.$("#book-status ul");
                _.each(_.keys(statuses), function(key) {
                    $ul.append("<li>" + key + ": " + statuses[key] + "</li>");
                }, this);
            }

            // Tags widget.
            // Since this page is called without getting removed, always call the widget.
            var $el = this.$("#book-tags");
            $el.tags();
            // console.info("[BookPageView]", "previous tags", $el.tags("option", "tagItems"));
            $el.tags("option", "tagItems", this.model.get("tags"));

            return this;
        }
    });

    return BookPage;
});
