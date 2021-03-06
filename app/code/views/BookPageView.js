/**
 * Individual book page view.
 **/
import {Hub} from 'Hub';
import {$, _, Backbone, Handlebars} from 'DefaultImports';
import BookPageTemplate from './templates/bookpage.html';
const ActivitiesView = require("./ActivitiesView.js");

const BookPageView = Backbone.View.extend({
    id: "bookPage",
    events: {
        "click .edit-this": "onEditThis",
        "click .add-another": "onAddAnother",
        "click .delete-this": "onDelete"
    },
    _logHeader: "[BookPageView]",

    initialize: function(options) {
        this._template = Handlebars.compile(BookPageTemplate);
        this.configuration = options.configuration || {};
        return this;
    },

    /**
     * Render a book model.
     * Ensures that all data needed by the template exists (empty arrays instead of undefined).
     * @return {Object} BookPageView
     */
    render: function() {
        var data = this.model.toJSON(),
            self = this;

        // Add hints for template.
        data._multipleAuthors = this.model.get("authors").length > 1;
        // Convert status object into list of objects with identical key/value keys.
        data._statusList = _.map(_.toPairs(data.status || []), function(pair) {
            return {statusKey: pair[0], statusValue: self.configuration.getText(pair[1])};
        });
        data._tags = data.tags || [];

        this.$el.html(this._template(data));

        this.addActivitiesView(this.model);

        return this;
    },

    /**
     * Add the Activities sub-view.
     * @param {Object} model SpineCollection model
     */
    addActivitiesView: function(model) {
        var view = new ActivitiesView({
            model: model,
            configuration: this.configuration
        });
        view.render();
        this.$(".activitiesViewContainer").append(view.$el);
        view.listenTo(model, "remove", view.remove);
    },

    // EVENTS //
    onAddAnother: function(event) {
        Hub.trigger("app:navigate", {url: "addbook"});
    },

    onDelete: function(event) {
        // Verify.
        if (window.confirm("Are you sure you want to delete this book?")) {
            // Delete & forward to main page.
            this.model.destroy({
                wait: true, 
                success: function() {
                    Hub.trigger("app:bookDeleted", {ok: true});
                },
                error: function() {
                    Hub.trigger("app:bookDeleted", {ok: false});
                }
            });
        }
    },

    onEditThis: function(event) {
        Hub.trigger("app:navigate", {url: "editbook/" + this.model.id});
    }
});

export {BookPageView};
