import {_, Backbone, Handlebars} from 'DefaultImports';
import SpineTemplate from './templates/spinelistitem.html';

/**
 * View for a single book within a section.
 */
class SpineView extends Backbone.View {
    constructor(options) {
        super(options);
        this.template = Handlebars.compile(SpineTemplate);
    }

    render() {
        this.$el.append(this.template({id: this.model.id, title: this.model.get('title')}));
        return this;
    }
};

export {SpineView};
