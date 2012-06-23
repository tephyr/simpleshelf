/**
 * Model for book
 */
window.Book = Backbone.Model.extend({
    defaults: {
        'type': 'book',
        'status': {'ownership': null, 'read': null},
        'public': true
    },
    url: function(){
        return '/' + window.simpleshelf.constants.dbName + '/' + this.get('id');
    },
    initialize: function(attributes){
        console.log('Book', 'initialize');
        _.bindAll(this, "addActivity", "getDefault", "getStatus", "select", "setStatus");
        // last piece to fire before this model finishes loading;
        // if activities is missing, add a new instance: if set in this.defaults, it violates encapsulation
        if (!this.get('activities')){
            this.set('activities', new ActivityList([]));
        }
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

    /**
     * Add an activity in one call
     * @param opts {Object} {date: date string, action: String}, IOW a valid Activity object's attributes
     **/
    addActivity: function(opts){
        this.get('activities').add(opts);
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

    select: function(){
        console.log('Book.select');
        this.collection.trigger('book:selected', this.get('id'));
    },

    setStatus: function(statusName, statusValue){
        var updatedStatus = {};
        updatedStatus[statusName] = statusValue;
        this.set(_.extend(this.get('status'), updatedStatus));
    }
});
