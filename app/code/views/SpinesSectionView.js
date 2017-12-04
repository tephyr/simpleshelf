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
        this.$el.append(this.template({id: this._key, value: this._count}));

        _.forEach(this.collection.getBooksByTitleSection(this._key), (book) => {
            this.addOne(book);
        });

        return this;
    }

    addOne(book) {
        const view = new SpineView({model: book});
        this.$('.list-group-flush').append(view.render().el);
    }
};

export {SpinesSectionView};
