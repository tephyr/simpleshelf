/**
 * Books page
 * - collection: BookCollection
 */
import {_, Backbone, Handlebars} from 'DefaultImports';
import {Hub} from 'Hub';
import BooksPageTemplate from './templates/bookspage.html';
import {SpinesSectionView} from './SpinesSectionView';

const BooksPageView = Backbone.View.extend({
    id: "booksPage",
    _logHeader: "[BooksPageView]",

    initialize: function(options) {
        this.template = Handlebars.compile(BooksPageTemplate);
        this._isRendered = false;
        this.listenTo(Hub, 'catalog:bookadded', this.onBookAdded);

        return this;
    },

    render: function() {
        // Render this view.
        this.$el.html(this.template());
        // Render all child views.
        this.addAll();
        this._isRendered = true;
        return this;
    },

    addAll: function() {
        const sectionData = this.collection.getSpineSummary();
        const sectionKeys = _.keys(sectionData).sort();
        let count;

        _.forEach(sectionKeys, (key) => {
            count = sectionData[key];
            this.addOne(key, count);
        });
    },

    /**
     * Add a single sub-view.
     * @param {Object} model SpineCollection model
     */
    addOne: function(key, count) {
        const view = new SpinesSectionView({
            collection: this.collection,
            key, count
        });
        view.render();
        this.$("#booksData").append(view.$el);
        // view.listenTo(model, "remove", view.remove);
    },

    isRendered: function() { return this._isRendered; },

    onBookAdded(data) {
        // Creating a new section?
        if (data.sectionCount === 1) {
            // TODO: Insert in correct order.
            this.addOne(key, 1);
        }
    }
});

export {BooksPageView};
