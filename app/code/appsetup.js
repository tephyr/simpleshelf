/**
 * One-time application setup functions.
 */
var _ = require("underscore");

module.exports = {
    overrideBackboneSync: function(Backbone, _) {
        /**
         * Override the original Backbone.sync, customize only as necessary
         */
        Backbone.sync = _.wrap(Backbone.sync, function(func, method, model, options){
            console.info("BB.sync", method);
            var promise; // Maintain sync's Promise.

            switch(method){
                case "delete":
                    console.log(method + ": " + JSON.stringify(model));
                    // include rev, or couchdb won't allow deletion
                    options.url = model.url() + "?rev=" + model.get("_rev");
                    
                    // delete from couchdb
                    promise = func(method, model, options);
                    break;

                case "update":
                    console.log(method + ": " + JSON.stringify(model));
                    options.type = 'PUT';
                    promise = func(method, model, options);

                    break;
                default:
                    promise = func(method, model, options);
                    break;
            }

            return promise;
        });
    }
};
