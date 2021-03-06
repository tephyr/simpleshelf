import {$, _, Backbone} from 'DefaultImports';
import {GlobalCountModel} from '../models/GlobalCount';
import {ReadingStatsModel} from '../models/ReadingStats';
import {BookCollection} from '../models/BookCollection';
import {TagCollection} from '../models/TagCollection';
import {Util} from 'Util';
import {ConfigurationModel} from '../models/Configuration.js';

const config = new ConfigurationModel();

/**
 * CatalogModule: all metadata regarding the library.
 */
class CatalogModule {
    constructor() {
        this.metadataUpToDate = false;
        this.booksFetched = false;
        this.configFetched = false;
        this.globalCountModel = new GlobalCountModel();
        this.readingStatsModel = new ReadingStatsModel();
        this.bookCollection = new BookCollection(null, {configuration: config});
        this.tagCollection = new TagCollection();
        this.configuration = config;
    }

    clearLibrary() {
        this.bookCollection.reset();
        this.tagCollection.reset();
        this.readingStatsModel.clear({silent: true});
        this.globalCountModel.clear({silent: true});
        this.booksFetched = false;
        this.metadataUpToDate = false;
    }

    fetchBooks() {
        const dfrd = $.Deferred();

        if (this.booksFetched) {
            dfrd.resolve();
        } else {
            $.when(this.bookCollection.fetch()).then(() => {
                this.booksFetched = true;
                dfrd.resolve();
            });
        }

        return dfrd;
    }

    /**
     * Load (or reload) the global count and books data.
     * @return Promise
     **/
    updateLibraryMetadata() {
        var deferred = $.Deferred();

        if (this.metadataUpToDate) {
            deferred.resolve();
        } else {
            $.when(
                this.globalCountModel.fetch(),
                this.readingStatsModel.fetch()
            ).then(_.bind(function() {
                    this.metadataUpToDate = true;
                    deferred.resolve();
                }, this),
                deferred.reject
            );
        }

        return deferred;
    }

    // EVENTS //

    /**
     * Filter & customize the payload for a book added event.
     * @param  {Object} model
     */
    onBookAdded(model) {
        // Ignore initial fetch.
        if (this.booksFetched) {
            // sectionKey, sectionCount
            const sectionData = this.bookCollection.getSpineSummary(),
                sectionKey = model.getCanonicalTitleKey();

            this.trigger('catalog:bookadded', {
                model,
                sectionKey,
                sectionCount: sectionData[sectionKey]
            });
        }
    }
};

// Create singleton, decorate with Events.
const catalog = new CatalogModule();
_.extend(catalog, Backbone.Events);

catalog.listenTo(catalog.bookCollection, 'add', catalog.onBookAdded);

export {catalog as Catalog};
