/**
 * Container for login/signup forms
 */
window.AuthenticationView = Backbone.View.extend({
    template: _.template(
        '<form>' +
        '<label for="name">Name</label> <input type="text" name="name" value="" autocapitalize="off" autocorrect="off">' +
        '<label for="password">Password</label> <input type="password" name="password" value="">' +
        '<input type="submit" name="submit" value="{{submitValue}}">' +
        '</form>'
    ),
    tagName: 'div',
    className: 'authentication-view',
    viewName: 'AuthenticationView',
    events: {
        'submit form': 'onSubmit'
    },

    initialize: function(options){
        _.bindAll(this, 'render', 'onSubmit');
        this.action = options.action || null;
    },

    render: function(){
        var templateOptions = {submitValue: ''};
        switch(this.action){
            case "getcredentials":
                templateOptions.submitValue = 'Login';
                break;

            case "signup":
                templateOptions.submitValue = 'Signup';
                break;
        }
        $(this.el).html(this.template(templateOptions));
        return this;
    },

    onSubmit: function(event){
        event.preventDefault();
        var $formElement = $('form', this.el);
        var userName = $('input:text[name=name]', $formElement).val();
        var userPw = $('input:password', $formElement).val();
        this.log('submitted', 'action', $(':submit', $formElement).val());
        if (this.action == "getcredentials"){
            this.options.dispatcher.trigger('authenticationview.login', {
                action: 'login',
                name: userName,
                password: userPw
            });
        }
    }
});
