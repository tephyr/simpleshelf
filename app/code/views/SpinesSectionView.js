import {_, Backbone, Handlebars} from 'DefaultImports';
import SpinesSectionTemplate from './templates/spinessection.html';
import {SpineView} from './SpineView';

/**
 * View for all books within a single section.
 */
class SpinesSectionView extends Backbone.View {
    constructor(options) {
        super(options);
        this._key = options.key;
        this._count = options.count;
        this.template = Handlebars.compile(SpinesSectionTemplate);
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
