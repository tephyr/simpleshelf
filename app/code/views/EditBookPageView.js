/**
 * Edit Book page.
 **/
var _ = require("underscore"),
    _s = require("underscore.string"),
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

    initialize: function(options) {
        this._logHeader = "[EditBookPage]";
        this._log("initialize");
        this._template = Handlebars.compile(EditBookPageTemplate);
        this.configuration = options.configuration || {};
        return this;
    },

    render: function() {
        // // Clear out any previous data.
        // this.$("form [type=text]").add("form textarea").val("");

        var ownershipConfig = this.configuration.get("ownership"),
            readConfig = this.configuration.get("read"),
            templateData = {
                hasOwnership: (_.isArray(ownershipConfig) && ownershipConfig.length > 0),
                hasRead: (_.isArray(readConfig) && readConfig.length > 0),
                statusRead: readConfig,
                statusOwnership: ownershipConfig
            };

        this._log("model.id", _.isObject(this.model) ? this.model.id : "no model");
        this.$el.html(this._template(templateData));

        return this;
    },

    /**
     * Create book, add all data to it.
     * @param  {Array}   formArray  Array of form elements, from $.serializeArray
     **/
    _fillModel: function(formArray) {
        // Convert serialized array of form values into object.
        var formObject = {};
        formArray.forEach(function(element) {
            formObject[element.name] = element.value;
        });

        this.model.set({
            title: formObject["editbookTitle"],
            authors: _s.lines(formObject["editbookAuthors"]),
            isbn: formObject["editbookIsbn"],
            publisher: formObject["editbookPublisher"],
            notePublic: formObject["editbookNotesPublic"],
            notesPrivate: formObject["editbookNotesPrivate"],
        });

        this.model.set({"public": formObject.editBookPublic === "on"});
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

        this._fillModel($(event.currentTarget).serializeArray());
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
