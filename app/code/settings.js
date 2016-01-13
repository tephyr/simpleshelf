"use strict";
/**
 * Store application-wide settings.
 * @return Singleton
 **/
define([
    "underscore",
    "backbone"
], function(_, Backbone) {

    var settings = Backbone.Model.extend({

    });

    return new settings();
});
