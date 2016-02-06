"use strict";
/**
 * Application configuration model.
 * Handles default (updateable through replication) and custom.
 * Documents: simpleshelf.config.default.json, simpleshelf.config.custom.json.
 * @return Singleton
 **/
var _ = require("underscore"),
    Backbone = require("backbone");

var ConfigurationModel = Backbone.Model.extend({
    url: "_view/configuration"
});

module.exports = ConfigurationModel;
