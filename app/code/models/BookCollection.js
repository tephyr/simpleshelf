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
        return "_view/books?reduce=false";
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
    },

    /**
     * Get books matching the given status.
     * @param  {Object} statusToCheck
     * @return {Array}               All books matching the status.
     */
    getBooksByStatus: function(statusToCheck={}) {
        const result = [];

        this.forEach((book) => {
            if (book.has('status')) {
                if (_.isMatch(book.get('status'), statusToCheck)) {
                    result.push(book);
                }
            }
        });

        return result;
    },

    /**
     * Get all books belonging to a single section.
     * @param  {String} key Section key.
     * @return {Array}
     */
    getBooksByTitleSection(key) {
        const booksInSection = this.filter((book) => {
            if (book.getCanonicalTitleKey() === key) {
                // TODO: handle non-alphanumeric
                return true;
            }
        });

        if (booksInSection.length > 1) {
            return _.sortBy(booksInSection, (book) => {
                return book.getCanonicalTitleSortable();
            });
        } else {
            return booksInSection;
        }
    },

    /**
     * Make object of {section, count} values.
     * @return {Object} {keys: all current section keys; values: count of books in those sections}
     */
    getSpineSummary: function() {
        const result = {'?': 0};
        let cTitle, titleKey;

        this.forEach((book) => {
            cTitle = book.getCanonicalTitle();
            if (_.isNil(cTitle)) {
                result['?'] = result['?'] + 1;
            } else {
                titleKey = cTitle.slice(0, 1).toLowerCase(); // TODO: non-alphabetic characters
                if (_.has(result, titleKey)) {
                    result[titleKey] = result[titleKey] + 1;
                } else {
                    result[titleKey] = 1;
                }
            }
        });

        return result;
    }
});

export {BookCollection};
