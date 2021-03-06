/**
 * Model for individual books.
 */
import {_, Backbone} from 'DefaultImports';
import {Util} from 'Util';

const PREFIXES = ['a', 'an', 'the'];

const Book = Backbone.Model.extend({
    _logHeader: '[Book]',
    idAttribute: '_id',
    configuration: null, // Set by caller only when needed for status changes.
    defaults: {
        'type': 'book',
        'public': true
    },

    initialize: function(attributes, options) {
        if (_.isObject(attributes) && _.has(attributes, 'configuration')) {
            // NOT ALLOWED.
            throw(new Error('configuration not allowed as a Book attribute.'));
        }

        this.priorData = {
            'canonicalTitle': this.getCanonicalTitle(),
            'canonicalTitleKey': this.getCanonicalTitleKey()
        };

        this.on('sync', this.onSync);
    },

    url: function(){
        const urlPrefix = 'data/';
        if (this.isNew()) {
            // Do not include non-existent server ID.
            return urlPrefix;
        } else {
            return urlPrefix + this.get(this.idAttribute);
        }
    },

    /**
     * Because CouchDB returns id & rev for some calls, and _id and _rev for others, 
     * handle those special cases here.
     **/
    parse: function(response) {
        if (_.has(response, 'id') && _.has(response, 'rev')) {
            response['_id'] = response['id'];
            response['_rev'] = response['rev'];
            delete response['id'];
            delete response['rev'];
            // Also get rid of 'ok' key.
            if (_.has(response, 'ok')) {
                delete response['ok'];
            }
        }

        // Order the activities by date.
        if (_.has(response, 'activities')) {
            response.activities = _.sortBy(response.activities, function(activity) {
                return activity.date;
            });
        }
        return response;
    },

    /**
     * Validate model.
     **/
    validate: function(attrs) {
        // Require title OR ISBN.
        if (!this._checkForValue(attrs, 'title') &&
            !this._checkForValue(attrs, 'isbn')) {
            return 'Missing title or ISBN.';
        } else if (_.trim(attrs.title) === '' && _.trim(attrs.isbn) === '') {
            // Keys exist but are empty strings.
            return 'Missing title or ISBN.';
        }
    },

    // NON-STANDARD METHODS //
    /**
     * Change a status, adding activity logging for some changes.
     * @param  {String} statusKey   'read', 'ownership', etc.
     * @param  {String} statusValue New value for key
     * @param  {String} asOfDate    iso8601-format date
     * @return {Object}             this
     */
    changeStatus: function(statusKey, statusValue, asOfDate) {
        let statusHash = {},
            activities,
            activityKey;

        // Change locally.
        statusHash = this.get('status') || {};
        statusHash[statusKey] = statusValue;
        this.set('status', statusHash);

        // Log 'read' status.
        if (statusKey === 'read') {
            if (!_.isObject(this.configuration)) {
                throw(new Error('Must have a valid configuration.'));
            }
            // Get activity key for the new read status (if any).
            activityKey = this.configuration.getActivityForStatus(statusValue);

            // If a value exists for this key, log as an activity.
            if (!_.isNull(activityKey)) {
                activities = this.get('activities') || [];

                activities.push({'date': asOfDate, 'action': activityKey});

                this.set('activities', activities);
            }
        }

        return this;
    },

    getCanonicalTitle() {
        const value = _.trim(this.get('title'));

        if (value.length === 0) {
            return '';
        }

        let canonicalized = false, canonicalTitle;

        const titleWords = value.split(' ');
        _.forEach(PREFIXES, (prefix) => {
            if (titleWords[0].toLowerCase() === prefix) {
                canonicalTitle = `${_.tail(titleWords).join(' ')}, ${titleWords[0]}`;
                canonicalized = true;
                return false;
            }
        });

        return canonicalized ? canonicalTitle : value;
    },

    /**
     * Get a sortable canonical title (only alphanumeric values, no whitespace).
     * @return {String}
     */
    getCanonicalTitleSortable() {
        let cTitle = this.getCanonicalTitle().toLowerCase();
        return cTitle.replace(/[^ a-z0-9]/g, "");
    },

    /**
     * Get first letter of canonical title, as lowercase.
     * @return {String}
     */
    getCanonicalTitleKey() {
        const key = this.getCanonicalTitleSortable().slice(0, 1);
        return Util.isAlphabetic(key) ? key : '?';
    },

    /**
     * Check if key exists and has a non-null value.
     **/
    _checkForValue: function(attrs, key) {
        return (_.has(attrs, key) && !_.isNull(attrs[key]));
    },

    /**
     * Store canonical data for next edit.
     * @param  {Object} model
     * @param  {Object} response
     * @param  {Object} options
     */
    onSync: function(model, response, options) {
        this.priorData.canonicalTitle = this.getCanonicalTitle();
        this.priorData.canonicalTitleKey = this.getCanonicalTitleKey();
    }
});

export {Book};
