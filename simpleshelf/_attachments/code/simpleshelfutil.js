window.simpleshelf = window.simpleshelf || {};

window.simpleshelf.util = {
    /**
     * Retrieve the current session
     * @param {Function} onSessionRetrieved
     */
    authGetSession: function(onSessionRetrieved){
        var jqxhr = $.ajax({
            type: "GET",
            url: "/_session", // ?basic=true
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Accept', 'application/json');
            }
        })
        .done(function(r) {
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
        });
    },

    /**
     * Login with the given name/password combo
     * @param {Object} options {name, password, success, error}
     */
    authLogin: function(options){
        options = options || {};

        var jqxhr = $.ajax({
                type: "POST",
                url: "/_session", // ?basic=true
                dataType: "json",
                data: {
                    name: options.name,
                    password: options.password
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Accept', 'application/json');
                }
            })
            .done(function(jqXHR) { 
                console.log("authLogin: success");
                if (options.success){
                    options.success(jqXHR);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log("authLogin: error");
                if (options.error){
                    options.error(jqXHR.status, errorThrown);
                }
            })
            .always(function() {
                console.log("authLogin: complete");
            });
    },

    authLogout: function(options){
        var jqxhr = $.ajax({
            type: "DELETE",
            url: "/_session", // ?basic=true
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Accept', 'application/json');
            }
        })
        .done(function(jqXHR) { 
            console.log("authLogout: success");
            if (options.success){
                options.success(jqXHR);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("authLogout: error");
            options.error();
        })
        .always(function() {
            console.log("authLogout: complete");
        });
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
            dateFormat: "yy-mm-dd",
            showButtonPanel: true
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
     * Clean an array of Strings, removing any empty elements
     */
    cleanStringArray: function(arr){
        var cleanedArray = _.map(arr, function(value){
            if (_.isString(value)) {
                value = $.trim(value);
                if (value.length > 0) {
                    return value;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        });

        return _.filter(cleanedArray, function(value) {
            return !_.isNull(value);
        });
    }
};
