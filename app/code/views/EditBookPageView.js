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
        this._okToLog = _.has(options, "okToLog") ? options.okToLog : true;
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
        this._log("model.id", _.isObject(this.model) ? this.model.id : "no model");

        this.$el.html(this._template(this._buildTemplateData()));

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

    _buildTemplateData: function() {
        var ownershipConfig = this.configuration.get("ownership"),
            readConfig = this.configuration.get("read"),
            templateData = {
                hasOwnership: _.isArray(ownershipConfig) && ownershipConfig.length > 0,
                hasRead: _.isArray(readConfig) && readConfig.length > 0,
                statusRead: this._buildStatusValues("read"),
                statusOwnership: this._buildStatusValues("ownership")
            };

        // Extend base data with existing model, if any.
        if (_.isObject(this.model)) {
            templateData = _.extend({}, templateData, this.model.toJSON());
            // Fill in missing defaults.
            if (!_.has(templateData, "public")) {
                templateData.public = false;
            }
            if (_.has(templateData, "authors")) {
                templateData.authors = templateData.authors.join("\n");
            }
        }

        return templateData;
    },

    /**
     * Create book, add all data to it.
     * @param  {Array}   formArray  Array of form elements, from $.serializeArray
     **/
    _fillModel: function(formArray) {
        // Convert serialized array of form values into object.
        var formObject = {},
            originalStatus = _.extend({}, this.model.get("status"));

        formArray.forEach(function(element) {
            formObject[element.name] = element.value;
        });

        this.model.set({
            title: formObject["editbookTitle"],
            authors: _s.lines(formObject["editbookAuthors"]),
            isbn: formObject["editbookISBN"],
            publisher: formObject["editbookPublisher"],
            notesPublic: formObject["editbookNotesPublic"],
            notesPrivate: formObject["editbookNotesPrivate"]
        });

        this.model.set({"public": formObject.editbookPublic === "on"});

        // Update change log if read/ownership status changed.
        if (formObject.editbookRead || formObject.editbookOwnership) {
            if (formObject.editbookRead) {
                // Do not update status unless it exists and is same as previous.
                if (!(_.has(originalStatus, "read") &&
                    originalStatus.read === formObject.editbookRead)) {
                    this.model.changeStatus("read", formObject.editbookRead, formObject.editbookReadDate);
                }
            }
            if (formObject.editbookOwnership) {
                // Do not update status unless it exists and is same as previous.
                if (!(_.has(originalStatus, "ownership") &&
                    originalStatus.ownership === formObject.editbookOwnership)) {
                    this.model.changeStatus("ownership", formObject.editbookOwnership);
                }
            }
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
        if (this._okToLog) {
            console.info(this._logHeader, _.toArray(arguments).join(" "));
        }
    }
});

module.exports = EditBookPage;
