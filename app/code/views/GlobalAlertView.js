/**
 * Global alert view.
 **/
import {_, Backbone, Handlebars} from 'DefaultImports';
import {Hub} from 'Hub';
import GlobalAlertTemplate from './templates/globalalert.html';

const GlobalAlertView = Backbone.View.extend({
    id: "globalAlert",

    initialize: function(options) {
        this.template = Handlebars.compile(GlobalAlertTemplate);
        if (_.has(options, "configuration")) {
            this.configuration = options.configuration;
        }

        this.listenToOnce(Hub, 'catalog:configfetched', this.render);
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

export {GlobalAlertView};
