var Handlebars = require("handlebars"),
    _ = require("underscore");

var registerHelpers = function() {
    /**
     * Basic list helper example
     * @param  {Array} items
     * @param  {Object} options
     * @return {Undef}
     */
    Handlebars.registerHelper('list', function(items, options) {
        var out = "<ul>";

        for(var i=0, l=items.length; i<l; i++) {
            out = out + "<li>" + options.fn(items[i]) + "</li>";
        }

        return out + "</ul>";
    });

    /**
     * Basic list helper example
     * @param  {Array} items
     * @param  {Object} options
     * @return {Undef}
     */
    Handlebars.registerHelper('bootstrapBasicList', function(items, options) {
        var out = "<ul class=\"list-group\">";

        for(var i = 0; i < items.length; i++) {
            if (_.isObject(items[i])) {
                out = out + "<li  class=\"list-group-item\">" + options.fn(items[i]) + "</li>";
            } else {
                out = out + "<li  class=\"list-group-item\">" + items[i] + "</li>";
            }
        }

        return out + "</ul>";
    });
};

module.exports = registerHelpers;
