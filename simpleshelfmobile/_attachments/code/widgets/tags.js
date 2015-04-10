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

        _setOption: function(key, value) {
            this.options[key] = value;
            this._addTags();
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
