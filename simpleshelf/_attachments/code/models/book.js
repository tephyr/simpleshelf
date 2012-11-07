/**
 * Model for book
 */
window.Book = Backbone.Model.extend({
    defaults: {
        'type': 'book',
        'public': true
    },
    url: function(){
        return 'data/' + this.get('id');
    },
    initialize: function(attributes){
        console.log('Book', 'initialize');
        _.bindAll(this,
            "addActivity",
            "getDefault",
            "getStatus",
            "getStatusComplete",
            "select",
            "setStatus"
        );
        // last pieces to fire before this model finishes loading
        // verify status has minimum defaults
        this.set('status', _.extend({}, {'ownership': null, 'read': null}, this.get('status')));
        // if activities is missing, add a new instance: if set in this.defaults, it violates encapsulation
        if (!this.get('activities')){
            this.set('activities', new ActivityList([]));
        }
    },

    /**
     * Add an activity in one call
     * @param opts {Object} {date: date string, action: String}, IOW a valid Activity object's attributes
     **/
    addActivity: function(opts){
        this.get('activities').add(opts);
    },

    /**
     * Return the authors as a string, optionally delimited ()
     * @param opts {Object} {delimiter: String}
     * @return String
     */
    getAuthorsAsString: function(opts){
        if (!this.get('authors')){
            return "";
        }

        if (opts && opts.delimiter){
            return this.get('authors').join(opts.delimiter);
        } else {
            return this.get('authors').join(" ");
        }
    },

    /**
     * Provide a default (empty) value for a given attribute
     * @param opts {Object} {attr:[status]}
     */
    getDefault: function(opts){
        if (!opts || !_.has(opts, 'attr')){
            return null;
        }

        var result = null;
        switch(opts.attr){
            case "status":
                result = {'read': null, 'ownership': null};
                break;

            default:
                break;
        }

        return result;
    },

    getStatus: function(status){
        var statusHash = this.get('status') || {};
        if (_.has(statusHash, status)){
            return statusHash[status];
        } else {
            return null;
        }
    },

    /**
     * Get the complete status object, using the default as a base
     */
    getStatusComplete: function(){
        var result = _.extend({},
            this.getDefault({'attr': 'status'}),
            this.get('status')
        );
        return result;
    },

    /**
     * Parse book info, removing activities list, to be parsed by child collection
     * Inspired by http://stackoverflow.com/questions/8501170/backbone-js-view-of-model-containing-collection
     */
    parse: function(resp){
        if (_.has(resp, 'ok') && resp.ok == true){
            // no need to parse
            return;
        }
        if (this.attributes.activities){
            this.attributes.activities.reset(resp.activities);
            delete resp.activities;
        } else {
            resp.activities = new ActivityList(resp.activities);
        }

        // enforce deeper attributes
        resp.status = _.extend(this.getDefault({attr: 'status'}), resp.status);

        return resp;
    },

    select: function(){
        console.log('Book.select');
        this.collection.trigger('book:selected', this.get('id'));
    },

    /**
     * Carefully set the status, to ensure "default" values are preserved
     */
    setStatus: function(statusName, statusValue){
        var updatedStatus = {};
        updatedStatus[statusName] = statusValue;
        var finalValue = {'status': _.extend({}, this.get('status'), updatedStatus)};
        this.set(finalValue);
    },

    validate: function(attrs){
        // MUST HAVE EITHER title OR isbn: 5
        var hasValidTitle = false;
        var hasValidIsbn = false;

        // do not validate new models
        if (this.isNew()) {
            return;
        }

        if (_.has(attrs, 'title') && 
            _.isString(attrs.title) && 
            $.trim(attrs.title).length > 0){
            hasValidTitle = true;
        }
        if (_.has(attrs, 'isbn') && 
            _.isString(attrs.isbn) && 
            $.trim(attrs.isbn).length > 0){
            hasValidIsbn = true;
        }
        if (!hasValidTitle && !hasValidIsbn){
            return 5; //"must have either title or isbn"
        }
    }
});
