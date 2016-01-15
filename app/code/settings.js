"use strict";
/**
 * Store application-wide settings.
 * @return Singleton
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var settings = Backbone.Model.extend({

});

module.exports = new settings();
