/**
 * Edit Book page.
 */
define([
    "underscore",
    "jquery",
    "backbone",
    "models/Book"
],
function(_, $, Backbone, Book) {
    var EditBookPage = Backbone.View.extend({
        events: {
            "click #editbook-submit": "onSubmit",
            "click #editbook-cancel": "onCancel"
        },
        render: function() {
            // Clear out any previous data.
            this.$("form [type=text]").add("form textarea").val("");
            console.info("model.id", _.isObject(this.model) ? this.model.id : "no model");
        },

        /**
         * Create book, add all data to it.
         **/
        _createModel: function() {
            this.model.set({
                title: this.$("#editbook-title").val(),
                authors: this.$("#editbook-authors").val().split("\n"),
                isbn: this.$("#editbook-isbn").val(),
                publisher: this.$("#editbook-publisher").val(),
                notePublic: this.$("#editbook-notes-public").val(),
                notesPrivate: this.$("#editbook-notes-private").val()
            });

            this.model.set({"public": this.$("#editbook-public").val() === "on"});
        },

        /** EVENTS **/
        onCancel: function(event) {
            event.preventDefault();
            console.info("Cancelling a book!");
        },

        onSaveSuccess: function() {
            window.alert("The book was successfully saved.");
        },

        onSaveFailure: function() {
            alert("The book did not save correctly.");
        },

        onSubmit: function(event) {
            event.preventDefault();
            console.info("Submitting a book!");
            this._createModel();
            if (this.model.isValid()) {
                // Save to db, fire event.
                console.info(this.model.toJSON());
                $.when(
                    this.model.save()
                ).then(
                    this.onSaveSuccess,
                    this.onSaveFailure
                );
            }
        }
    });

    return EditBookPage;
});
