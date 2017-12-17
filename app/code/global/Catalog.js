import {$, _} from 'DefaultImports';
import {GlobalCountModel} from '../models/GlobalCount';
import {ReadingStatsModel} from '../models/ReadingStats';
import {BookCollection} from '../models/BookCollection';
import {TagCollection} from '../models/TagCollection';
const AppConfigurationModel = require('../models/Configuration.js');

const config = new AppConfigurationModel();

// CatalogModule: all metadata regarding the library.
// Typically, these data will change only when a books is added/edited/deleted.
const CatalogModule = {
    metadataUpToDate: false,
    booksFetched: false,
    globalCountModel: new GlobalCountModel(),
    readingStatsModel: new ReadingStatsModel(),
    bookCollection: new BookCollection(null, {configuration: config}),
    tagCollection: new TagCollection(),
    configuration: config,

    fetchBooks: function() {
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

// TODO: switch from const to class (safely create singleton CatalogModule).
// const catalog = new CatalogModule();

export {CatalogModule as Catalog};
