/**
 * Get count of database-wide values.
 **/
import {_, Backbone} from 'DefaultImports';

const GlobalCountModel = Backbone.Model.extend({
    url: function() {
        return "view/global?group=true";
    },

    /**
     * Parse the *grouped* values.
     **/
    parse: function(response, options){
        var results = {};

        if (_.has(response, "rows") && _.isArray(response.rows)) {
            _.each(response.rows, function(row) {
                results[row.key] = row.value;
            });
        }

        return results;
    },

    toJSON: function() {
        var result = this.attributes;
        // Customize the strings.
        _.each(_.pairs(this.attributes), function(pair) {
            result[pair[0] + "_fmt"] = new Intl.NumberFormat().format(pair[1]);
        });
        return result;
    },

    /* Custom functions. */
    /**
     * Format a field simply (commas after thousands).
     */
    formatSimply: function(fieldName) {
        return new Intl.NumberFormat().format(this.get(fieldName), 0);
    }

});

export {GlobalCountModel};
