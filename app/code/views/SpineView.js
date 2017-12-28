import {_, Backbone, Handlebars} from 'DefaultImports';
import {Util} from 'Util';
import SpineTemplate from './templates/spinelistitem.html';

/**
 * View for a single book within a section.
 * - model: Book
 */
class SpineView extends Backbone.View {
    constructor(options) {
        super(options);
        this.template = Handlebars.compile(SpineTemplate);
        this._initialKey = options.initialKey;

        this.listenTo(this.model, 'destroy', this.onBookRemoved);
        this.listenTo(this.model, 'removefromsection', this.onRemoveFromSection);
    }

    render() {
        this.$el.append(this.template({id: this.model.id, title: this.model.get('title')}));
        return this;
    }

    onBookRemoved() {
        this.remove();
    }

    onRemoveFromSection(data) {
        if (data.sectionKey === this._initialKey) {
            this.remove();
        }
    }
};

export {SpineView};
