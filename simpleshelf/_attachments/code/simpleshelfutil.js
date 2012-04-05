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
    },

    /**
     * Build a login form, attach to body as div#loginform
     **/
    buildLoginForm: function(){
        var dialogTemplate = _.template(
            '<div id="loginform" title="Login to simpleshelf">' + 
            '<div class="row"><label for="userid">User id</label><input type="text" id="userid"/></div>' +
            '<div class="row"><label for="userpw">Password</label><input type="password" id="userpw"/></div>' +
            '</div>'
        );

        return $(dialogTemplate()).css('display', 'none').appendTo('body');
    },

    /**
     * Retrieve the current session
     * @param {Function} onSessionRetrieved
     */
    authGetSession: function(onSessionRetrieved){
        $.couch.session({
            success : function(r) {
                var result = {authInfo: null, status: "unknown"};
                var userCtx = r.userCtx;
                if (userCtx.name) {
                    result.status = "loggedIn";
                } else if (userCtx.roles.indexOf("_admin") != -1) {
                    result.status = "adminParty";
                } else {
                    result.status = "loggedOut";
                };
                result.authInfo = r;
                if (_.isFunction(onSessionRetrieved)){
                    onSessionRetrieved(result);
                }
          }});
    },

    /**
     * Login with the given name/password combo
     * @param {Object} options {name, password, success, error}
     */
    authLogin: function(options){
        $.couch.login(options);
    }
};
