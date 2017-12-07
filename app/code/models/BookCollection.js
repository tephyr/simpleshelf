/**
 *  Collection of books.
 **/
import {_, Backbone} from 'DefaultImports';
import {Book} from './Book';

const BookCollection = Backbone.Collection.extend({
    model: Book,
    initialize: function(models, options) {
        this._configuration = options.configuration;
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
        const isAlphaRegex = /[a-z]/;
        const booksInSection = this.filter((book) => {
            if (key === '?') {
                return !isAlphaRegex.test(book.getCanonicalTitleKey());
            } else  {
                return book.getCanonicalTitleKey() === key;
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
        const isDigitRegex = /[0-9]/;
        let cTitle, titleKey;

        this.forEach((book) => {
            cTitle = book.getCanonicalTitle();
            if (_.isNil(cTitle) || cTitle.length === 0) {
                result['?'] = result['?'] + 1;
            } else {
                titleKey = book.getCanonicalTitleKey();
                if (isDigitRegex.test(titleKey)) {
                    result['?'] = result['?'] + 1;
                } else if (_.has(result, titleKey)) {
                    result[titleKey] = result[titleKey] + 1;
                } else {
                    result[titleKey] = 1;
                }
            }
        });

        if (result['?'] === 0) { delete result['?']; }

        return result;
    }
});

export {BookCollection};
