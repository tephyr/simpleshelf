/**
 * Edit Book page.
 **/
var _ = require("underscore"),
    _s = require("underscore.string"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    EditBookPageTemplate = require("./templates/editbookpage.html"),
    Book = require("../models/Book.js"),
    TagInputView = require("./TagInputView.js");

var EditBookPage = Backbone.View.extend({
    id: "editBookPage",

    events: {
        "submit .editbook-form": "onSubmit",
        "click .editbook-cancel": "onCancel",
        "change #editbookRead": "onChangeRead"
    },

    initialize: function(options) {
        this._logHeader = "[EditBookPage]";
        this._log("initialize");
        this._template = Handlebars.compile(EditBookPageTemplate);
        this.configuration = options.configuration || {};
        this._tagInputView = new TagInputView({
            configuration: this.configuration,
            tagCollection: options.tagCollection
        });
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
                statusRead: this._buildStatusValues("read"),
                statusOwnership: this._buildStatusValues("ownership")
            };

        this._log("model.id", _.isObject(this.model) ? this.model.id : "no model");
        this.$el.html(this._template(templateData));

        // Render subviews.
        this._tagInputView.model = this.model;
        this._tagInputView.$el = this.$(".taginputparent");
        this._tagInputView.render();

        return this;
    },

    /**
     * Build a list of [key, text] pairs for the Reading/Ownership status form input.
     * @param  {String} status Which status to use.
     * @return {Array}
     */
    _buildStatusValues: function(status) {
        var result = [],
            self = this;

        _.each(this.configuration.get(status), function(key) {
            result.push([key, self.configuration.getText(key)]);
        });

        return result;
    },

    /**
     * Create book, add all data to it.
     * @param  {Array}   formArray  Array of form elements, from $.serializeArray
     **/
    _fillModel: function(formArray) {
        // Convert serialized array of form values into object.
        var formObject = {},
            status = {};

        formArray.forEach(function(element) {
            formObject[element.name] = element.value;
        });

        this.model.set({
            title: formObject["editbookTitle"],
            authors: _s.lines(formObject["editbookAuthors"]),
            isbn: formObject["editbookIsbn"],
            publisher: formObject["editbookPublisher"],
            notePublic: formObject["editbookNotesPublic"],
            notesPrivate: formObject["editbookNotesPrivate"]
        });

        this.model.set({"public": formObject.editBookPublic === "on"});

        if (formObject.editbookRead || formObject.editbookOwnership) {
            if (formObject.editbookRead) {
                status["read"] = formObject.editbookRead;
            }
            if (formObject.editbookOwnership) {
                status["ownership"] = formObject.editbookOwnership;
            }

            this.model.set("status", status);
        }
    },

    /** EVENTS **/
    onCancel: function(event) {
        this._log("onCancel");
        event.preventDefault();
        this.trigger("app:navigate", {view: "main"});
    },

    /**
     * If the read status changes from the original, then activate the read date input.
     * @param  {Object} event
     * @return {undef}
     */
    onChangeRead: function(event) {
        // Handle for Add Book setup (no model).
        // TODO: handle when editing existing book.
        var comparisonValue = "";
        if (this.$("#editbookRead").val() !== comparisonValue) {
            this.$("[name='editbookReadDate']").prop("readonly", false);
        } else {
            this.$("[name='editbookReadDate']").prop("readonly", true);
        }
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
