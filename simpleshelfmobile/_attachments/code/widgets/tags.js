/**
 * Tag viewer for simpleshelf mobile.
 * Based on jQueryUI Widget.
 */
define([
    "jquery"
],
function($) {
    console.info("[widgets/tags]", "Loaded");
    $.widget( "simpleshelfmobile.tags", {
     
        options: {
            tagItems: [],
            tagTemplate: "<div class='tag ui-corner-all ui-shadow'>{{tag}}</div>"
        },

        _create: function() {
            console.info("[widgets/tags]", "Creating",
                "tagItems.length:", this.options.tagItems.length);
            this.element.addClass("tags-widget").empty();
            if (this.options.tagItems.length > 0) {
                this._addTags();
            }
        },

        /**
         * Load tags to show.
         **/
        tags: function( value ) {
     
            // No value passed, act as a getter.
            if ( value === undefined ) {
                return this.options.tags;
            // Value passed, act as a setter.
            } else {
                // Store updated list of tags.
                this.options.tags = tags;
                // Clear element & add tags.
                this._addTags();
     
            }
        },

        /**
         * Add existing tags.
         **/
        _addTags: function() {
            var self = this;

            this.element.empty();

            $.each(this.options.tagItems, function(index, tag) {
                self.element.append(self.options.tagTemplate.replace("{{tag}}", tag));
            });
        }
     
    });
});
