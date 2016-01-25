/**
 * Edit Book page.
 **/
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    EditBookPageTemplate = require("./templates/editbookpage.html"),
    Book = require("../models/Book.js");

var EditBookPage = Backbone.View.extend({
    id: "editBookPage",

    events: {
        "submit .editbook-form": "onSubmit",
        "click .editbook-cancel": "onCancel"
    },

    initialize: function() {
        this._logHeader = "[EditBookPage]";
        this._log("initialize");
        this._template = Handlebars.compile(EditBookPageTemplate);
        return this;
    },

    render: function() {
        // // Clear out any previous data.
        // this.$("form [type=text]").add("form textarea").val("");
        this._log("model.id", _.isObject(this.model) ? this.model.id : "no model");
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
        this._log("onCancel");
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
        this._log("Submitting a book!");
        return false;

        this._fillModel();
        if (this.model.isValid()) {
            // Save to db, fire event.
            console.table(this.model.toJSON());
            $.when(
                this.model.save(null, {wait: true})
            ).then(
                _.bind(this.onSaveSuccess, this),
                _.bind(this.onSaveFailure, this)
            );
        } else {
            alert(this.model.validationError);
        }
    },

    _log: function() {
        console.info(this._logHeader, _.toArray(arguments).join(" "));
    }
});

module.exports = EditBookPage;
