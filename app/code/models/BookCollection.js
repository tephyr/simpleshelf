/**
 *  Collection of books.
 **/
import {_, Backbone} from 'DefaultImports';
import {Book} from './Book';

const BookCollection = Backbone.Collection.extend({
    initialize: function(models, options) {
        this._configuration = options.configuration;
    },

    model: function(attrs, options) {
        if (!_.has(options, 'configuration')) {
            options.configuration = this._configuration;
        }

        return new Book(attrs, options);
    },

    url: function() {
        // TODO: this filters by status.read===reading; add option to get all books & different statuses.
        return "_view/books?key=%22reading%22&reduce=false";
    },
    /**
     * Parse the returned JSON.
     **/
    parse: function(response, options){
        var parsed = [];

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            _.each(response.rows, function(row) {
                parsed.push(row.value);
            });
        }

        return parsed;
    }
});

export {BookCollection};
