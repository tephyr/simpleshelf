window.simpleshelf = window.simpleshelf || {};

window.simpleshelf.util = {
    /**
     * Build a select form element, with initial empty value
     */
    buildSelect: function(selectName, options, selectedOption){
        var $formElement = $('<select/>')
            .attr('name', selectName)
            .append('<option/>')
            .attr('value', '');
        // add all possible options
        var isSelected;
        _.each(options, function(val){
            if (selectedOption && selectedOption == val){
                isSelected = {'selected': 'selected'};
            } else {
                isSelected = {};
            }
            $('<option/>')
                .text(val)
                .attr(isSelected)
                .appendTo($formElement);
        });
        return $formElement;
    }
};
