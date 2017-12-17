import {$, _, Backbone} from 'DefaultImports';
import {GlobalCountModel} from '../models/GlobalCount';
import {ReadingStatsModel} from '../models/ReadingStats';
import {BookCollection} from '../models/BookCollection';
import {TagCollection} from '../models/TagCollection';
const AppConfigurationModel = require('../models/Configuration.js');

const config = new AppConfigurationModel();

/**
 * CatalogModule: all metadata regarding the library.
 */
class CatalogModule {
    constructor() {
        this.metadataUpToDate = false;
        this.booksFetched = false;
        this.globalCountModel = new GlobalCountModel();
        this.readingStatsModel = new ReadingStatsModel();
        this.bookCollection = new BookCollection(null, {configuration: config});
        this.tagCollection = new TagCollection();
        this.configuration = config;
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
};

// Create singleton, decorate with Events.
const catalog = new CatalogModule();
_.extend(catalog, Backbone.Events);

export {catalog as Catalog};
