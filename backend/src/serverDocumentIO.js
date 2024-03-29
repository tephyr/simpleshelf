const _ = require('lodash');

/**
 * Get all *relevant* documents (books, config, etc).
 * @param  {Object} db nano DB reference
 * @return {Object}    {count: Number, docs: Array}
 */
async function getDocuments(db) {
    const allDocs = await db.list({
        include_docs: true
    });

    // console.info('getDocuments:allDocs', allDocs)
    // Currently-known "types": configuration, i18n, books

    const filteredDocs = _.get(allDocs, 'rows', []).map((fullDoc) => {
        let result;
        switch(_.get(fullDoc.doc, 'type', '')) {
            case 'book':
                result = fullDoc.doc;
                break;

            case 'configuration':
                // Ignore configurationType: default
                if (_.get(fullDoc.doc, 'configurationType', 'default') !== 'default') {
                    result = fullDoc.doc;
                }
                break;

            // Drop i18n type by not inserting into filteredDocs.
        }

        return result;
    });

    _.remove(filteredDocs, _.isNil);

    return filteredDocs;
};

/**
 * Add documents to db in bulk.
 * @param {Object} nano db object
 * @param {Object} payload {docs: Array}
 */
async function setDocuments(db, payload) {
    // Documents must have the _rev property if they are *updates* or *deletions*.
    const results = await db.bulk(payload);
    return results; 
};

module.exports = {
    getDocuments,
    setDocuments
};
