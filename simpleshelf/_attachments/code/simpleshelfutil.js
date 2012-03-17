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
    },

    buildStatusFormRead: function(elementSelect){
        var displayText = {
            'intro': "Select the new <strong>read</strong> status, and optionally a date to which it applies."
        };

        var $dpInput = $('<input id="dateRead" type="text"/>');

        var $datePicker = $dpInput.datepicker({
            dateFormat: "yy-mm-dd"
        });

        var layout = "<table><tr><td>Read status</td><td><span id='statusinput'/></td></tr>" + 
            "<tr><td>Eff. date</td><td><span id='dpinput'/></td></tr></table>";

        var $formElement = $('<div id="dialogStatusRead" title="Change Read status"/>')
            .append($("<p>" + displayText.intro + "</p>"))
            .append($(layout));
        $('#statusinput', $formElement).replaceWith(elementSelect);
        $('#dpinput', $formElement).replaceWith($dpInput);
        return $formElement;
    }
};
