import {_, Backbone, Handlebars} from 'DefaultImports';
import SpineTemplate from './templates/spinelistitem.html';

/**
 * View for a single book within a section.
 * - model: Book
 */
class SpineView extends Backbone.View {
    constructor(options) {
        super(options);
        this.template = Handlebars.compile(SpineTemplate);

        this.listenTo(this.model, 'change', this.onBookChanged);
        this.listenTo(this.model, 'destroy', this.onBookRemoved);
    }

    render() {
        this.$el.append(this.template({id: this.model.id, title: this.model.get('title')}));
        return this;
    }

    onBookChanged() {
        this.$('a').text(this.model.get('title'));
    }

    onBookRemoved() {
        this.remove();
    }
};

export {SpineView};
