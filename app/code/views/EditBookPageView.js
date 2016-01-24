/**
 * Edit Book page.
 **/
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    EditBookPageTemplate = require("./templates/editbookpage.html"),
    Book = require("../models/Book.js");

var EditBookPage = Backbone.View.extend({
    id: "editbook",

    events: {
        "click #editbookSubmit": "onSubmit",
        "click #editbookCancel": "onCancel"
    },

    initialize: function() {
        this._template = Handlebars.compile(EditBookPageTemplate);
        return this;
    },

    render: function() {
        // // Clear out any previous data.
        // this.$("form [type=text]").add("form textarea").val("");
        console.info("model.id", _.isObject(this.model) ? this.model.id : "no model");
        this.$el.html(this._template());
        return this;
    },

    /**
     * Create book, add all data to it.
     **/
    _fillModel: function() {
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
        this.trigger("app:navigate", {view: "main"});
    },

    onSaveSuccess: function() {
        this.trigger("app:bookChanged", {id: this.model.id});
        this.trigger("app:navigate", {view: "book", id: this.model.id});
    },

    onSaveFailure: function() {
        // TODO: handle better.
        alert("The book did not save correctly.");
    },

    onSubmit: function(event) {
        event.preventDefault();
        console.info("Submitting a book!");
        this._fillModel();
        if (this.model.isValid()) {
            // Save to db, fire event.
            console.info(this.model.toJSON());
            $.when(
                this.model.save(null, {wait: true})
            ).then(
                _.bind(this.onSaveSuccess, this),
                _.bind(this.onSaveFailure, this)
            );
        } else {
            alert(this.model.validationError);
        }
    }
});

module.exports = EditBookPage;
