import {$, _} from 'DefaultImports';
import {SpineCollection} from '../models/SpineCollection';
import {BooksByLetterCollection} from '../models/BooksByLetterCollection';
import {GlobalCountModel} from '../models/GlobalCount';
import {ReadingStatsModel} from '../models/ReadingStats';
import {BookCollection} from '../models/BookCollection';
import {TagCollection} from '../models/TagCollection';

// CatalogModule: all metadata regarding the library.
// Typically, these data will change only when a books is added/edited/deleted.
const CatalogModule = {
    spinesInitialized: false,
    booksByLetterInitialized: false,
    metadataUpToDate: false,
    spineCollection: new SpineCollection(),
    booksByLetterCollection: new BooksByLetterCollection(),
    globalCountModel: new GlobalCountModel(),
    readingStatsModel: new ReadingStatsModel(),
    bookCollection: new BookCollection(),
    tagCollection: new TagCollection(),
    /**
     * Load the spines collection, fetching only when necessary.
     **/
    loadSpines: function(forceLoad) {
        var deferred = $.Deferred();
        if (!this.spinesInitialized || forceLoad) {
            this.spineCollection.fetch()
                .done(function() {
                    deferred.resolve();
                })
                .fail(function() {
                    deferred.reject();
                })
                .always(_.bind(function() {
                    this.spinesInitialized = true;
                }, this));
        } else {
            deferred.resolve();
        }

        return deferred;
    },
    /**
     * Load the books-by-letter collection, fetching only when necessary.
     **/
    loadBooksByLetter: function(forceLoad) {
        var deferred = $.Deferred();
        if (!this.booksByLetterInitialized || forceLoad) {
            this.booksByLetterCollection.fetch()
                .done(deferred.resolve)
                .fail(deferred.reject)
                .always(_.bind(function() {
                    this.booksByLetterInitialized = true;
                }, this));
        } else {
            deferred.resolve();
        }

        return deferred;
    },

    /**
     * Load (or reload) the global count and books data.
     * @return Promise
     **/
    updateLibraryMetadata: function() {
        var deferred = $.Deferred();

        if (this.metadataUpToDate) {
            deferred.resolve();
        } else {
            $.when(
                this.globalCountModel.fetch(),
                this.readingStatsModel.fetch(),
                this.bookCollection.fetch(),
                this.spineCollection.fetch()
            ).then(_.bind(function() {
                    this.metadataUpToDate = true;
                    deferred.resolve();
                }, this),
                deferred.reject
            );
        }

        return deferred;
    }
};

// TODO: switch from const to class (safely create singleton CatalogModule).
// const catalog = new CatalogModule();

export {CatalogModule as Catalog};
