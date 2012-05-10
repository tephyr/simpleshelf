/**
 * Views for simpleshelf
 * All view setup code goes here.
 */

// set underscore to use mustache-style interpolation
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

/**
 * Add close() method to all views
 * Shamelessly copied from lostechies.com (see library.js::AppView)
 */
Backbone.View.prototype.close = function(){
    this.remove();
    this.unbind();
    if (this.onClose){
        this.onClose();
    }
};

Backbone.View.prototype.log = function(){
    if (_.has(this.options, 'okToLog') && this.options.okToLog){
        console.log.apply(this, arguments);
    }
};
