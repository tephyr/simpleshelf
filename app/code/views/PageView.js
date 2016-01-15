/**
 * Page view constructor
 * Handles all jQuery Mobile setup for any sub-classed page.
 */
var Backbone = require("backbone");

var PageView = Backbone.View.extend({
    tagName: "div",
    isInDOM: false,
    _name: null,
    getName: function() {
        return this._name;
    },

    postRender: function() {
        this.isInDOM = true;
        return this;
    },

    render: function() {
        if (this.isInDOM) {
            console.warn(this.getName() + " already in DOM.");
        } else {
            if (this.model) {
                this.$el.html(this.template(this.model.toJSON()));
            } else {
                this.$el.html(this.template());
            }
            // Set jQuery Mobile attributes here.
            this.$el.attr("data-role", "page");
            // Append to body.
            $("body").append(this.$el);
        }
        return this;
    }
});

module.exports = PageView;
