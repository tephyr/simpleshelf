/**
 * Global alert view.
 **/
var _ = require("underscore"),
    Backbone = require("backbone"),
    Handlebars = require("handlebars"),
    GlobalAlertTemplate = require("./templates/globalalert.html");

var globalAlertView = Backbone.View.extend({
    id: "globalAlert",

    initialize: function(options) {
        this.template = Handlebars.compile(GlobalAlertTemplate);
        if (_.has(options, "configuration")) {
            this.configuration = options.configuration;
        }
        return this;
    },

    render: function() {
        var data = {
            messages: this.configuration.getMessagesForView('global')
        };

        this.$el.html(this.template(data));

        return this;
    }
});

module.exports = globalAlertView;
