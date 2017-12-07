/**
 * Books page
 * - collection: BookCollection
 */
import {_, Backbone, Handlebars} from 'DefaultImports';
import BooksPageTemplate from './templates/bookspage.html';
import {SpinesSectionView} from './SpinesSectionView';

const BooksPageView = Backbone.View.extend({
    id: "booksPage",
    _logHeader: "[BooksPageView]",

    initialize: function(options) {
        this.template = Handlebars.compile(BooksPageTemplate);

        return this;
    },

    render: function() {
        // Render this view.
        this.$el.html(this.template());
        // Render all child views.
        this.addAll();
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
    }
});

export {BooksPageView};
