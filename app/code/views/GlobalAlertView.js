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
        var data = {messages: []},
            messages = this.configuration.get("messages"),
            // Hierarchy: success/info/warning/danger.
            score = {
                success: 20,
                info: 15,
                warning: 10,
                danger: 5
            };

        // Find global messages, push into messages array, sort by score.
        if (_.isObject(messages)) {
            if (_.has(messages, "global")) {
                _.each(_.pairs(messages.global), function(pair) {
                    data.messages.push({
                        alertType: pair[0],
                        alertMsg: pair[1]
                    });
                });

                try {
                    data.messages = _.sortBy(data.messages, function(msg) {
                        return score[msg.alertType];
                    });
                } catch(exc) {
                    // Don't worry if config had a bad key, just show the messages unsorted.
                }
            }
        }

        this.$el.html(this.template(data));

        return this;
    }
});

module.exports = globalAlertView;
