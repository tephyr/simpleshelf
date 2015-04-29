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
            "click #editbook-submit": "onSubmit"
        },
        render: function() {
            // Clear out any previous data.
            this.$("form [type=text]").add("form textarea").val("");
        },

        /** EVENTS **/
        onSubmit: function(event) {
            event.preventDefault();
            console.info("Submitting a book!");
        }
    });

    return EditBookPage;
});
