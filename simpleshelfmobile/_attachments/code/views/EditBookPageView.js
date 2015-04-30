/**
 * Edit Book page.
 */
define([
    "underscore",
    "jquery",
    "backbone"
],
function(_, $, Backbone) {
    var EditBookPage = Backbone.View.extend({
        events: {
            "click #editbook-submit": "onSubmit",
            "click #editbook-cancel": "onCancel"
        },
        render: function() {
            // Clear out any previous data.
            this.$("form [type=text]").add("form textarea").val("");
        },

        /** EVENTS **/
        onCancel: function(event) {
            event.preventDefault();
            console.info("Cancelling a book!");
        },

        onSubmit: function(event) {
            event.preventDefault();
            console.info("Submitting a book!");
        }
    });

    return EditBookPage;
});
