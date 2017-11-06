/**
 *  Collection of books.
 **/
import {_, Backbone} from 'DefaultImports';
import {Book} from './Book';

const BookCollection = Backbone.Collection.extend({
    model: Book,
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
