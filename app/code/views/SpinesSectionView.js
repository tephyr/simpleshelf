import {_, Backbone, Handlebars} from 'DefaultImports';
import {Hub} from 'Hub';
import SpinesSectionTemplate from './templates/spinessection.html';
import {SpineView} from './SpineView';

/**
 * View for all books within a single section.
 * - collection: BookCollection
 */
class SpinesSectionView extends Backbone.View {
    constructor(options) {
        super(options);
        this._key = options.key;
        this._count = options.count;
        this.template = Handlebars.compile(SpinesSectionTemplate);
        this.listenTo(Hub, 'catalog:bookadded', this.onBookAdded);
    }

    render() {
        // Template expects id, idText, value.  idText is visible to user.
        const templateData = {id: this._key, idText: this._key, value: this._count};
        if (this._key === '?') {
            templateData.id = '0'; // Accordion cannot handle '?' in href.
        }
        this.$el.append(this.template(templateData));

        _.forEach(this.collection.getBooksByTitleSection(this._key), (book) => {
            this.addOne(book);
        });

        return this;
    }

    addOne(book) {
        const view = new SpineView({model: book});
        this.$('.list-group-flush').append(view.render().el);
        this.listenTo(book, 'destroy', this.onBookDestroyed);
    }

    insertOne(book) {
        const booksInSection = this.collection.getBooksByTitleSection(this._key),
            view = new SpineView({model: book});
        
        if (book.id === _.head(booksInSection).id) {
            // first
            this.$('.list-group').prepend(view.render().el);
        } else if (book.id === _.last(booksInSection).id) {
            // last
            this.$('.list-group').append(view.render().el);
        } else {
            // middle
            const idx = _.findIndex(booksInSection, (b) => {
                return b.id === book.id;
            }, 1);
            this.$('.list-group > div').eq(idx).before(view.render().el);
        }

        this.listenTo(book, 'destroy', this.onBookDestroyed);
    }

    onBookAdded(data) {
        if (this._key === '?') {
            if (!data.sectionKeyIsAlphabetic) {
                this.insertOne(data.model);
            }
        } else {
            if (data.sectionKey === this._key) {
                this.insertOne(data.model);
            }
        }
    }

    onBookDestroyed() {
        // Lower count by one, or remove entirely.
        if (this._count === 1) {
            this.remove();
        } else {
            this._count--;
            this.$('.section-count').text(this._count);
        }
    }
};

export {SpinesSectionView};
