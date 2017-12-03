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

    /**
     * Make list of book tags.
     */
    Handlebars.registerHelper('bookTags', function(items, options) {
        var out = "<div class=\"book-tags\">";

        for (var i = 0; i < items.length; i++) {
            out = out + "<span class=\"badge badge-pill badge-primary\">" + items[i] + "</span>&nbsp;";
        }

        return out + "</div>";
    });

    /**
     * Comparison operator
     * Examples::
     *
     *   {#compare Database.Tables.Count ">" 5}}
         There are more than 5 tables
         {{/compare}}

         {{#compare "Test" "Test"}}
         Default comparison of "==="
         {{/compare}}

     * Courtesy http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
     */
    Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
        var operators, result;
        
        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
        
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }
        
        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };
        
        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
        
        result = operators[operator](lvalue, rvalue);
        
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });
};

module.exports = registerHelpers;
