/**
 * Navigation for entire app
 */
window.NavigationView = Backbone.View.extend({
    template: _.template(
        '<ul></ul>'
    ),
    tagName: "div",
    className: "navigation-view",
    events: {
      'click a.newbook': 'addBook',
      'click a.index': 'goIndex',
      'click a.login': 'logIn',
      'click a.next': 'gotoNext',
      'click a.prev': 'gotoPrev'
    },
    viewName: 'NavigationView',

    initialize: function(options){
        _.bindAll(this, "render",
            "addBook", "askedForCredentials",
            "goIndex", "gotoPrev", "gotoNext",
            "hideGoto", "logIn", "loggedIn",
            "loggedOut", "showGoto",
            "_updateLinks");
        this.model.bind('change:status', this._updateLinks);
        this.options.okToLog = true;
    },

    render: function(){
        // get template
        var $parent = $(this.template());

        // add links
        var links = {
            "prev": {"text": "Previous", "show": false},
            "next": {"text": "Next", "show": false},
            "newbook": {"text": "New book"},
            "index": "Index",
            "login": "Login"
        };

        var linkTemplate = _.template('<li class="{{key}}"><a href="#{{key}}" class="{{key}}">{{name}}</a></li>');
        var text, show, $li;
        _.each(links, function(value, key, list){
            if (_.isString(value)){
                text = value;
                show = true;
            } else {
                text = value.text;
                show = value.show || true;
            }
            $li = $(linkTemplate({'key': key, 'name': text}));
            $parent.append($li);
            if (!show){
                $li.filter('li').hide();
            }
        });

        $(this.el).html($parent);
        return this;
    },

    goIndex: function(event){
        event.preventDefault();
        // return home
        this.options.dispatcher.trigger('navigation:index');
    },

    addBook: function(event){
        event.preventDefault();
        // show new book form
        this.options.dispatcher.trigger('navigation:newbook');
    },

    logIn: function(event){
        event.preventDefault();
        if (window.authInfo.get('status') != 'loggedIn'){
            // navigate to authentication page
            window.app.authenticate();
        } else {
            // log out
            this.options.dispatcher.trigger('navigation:logout', {'action': 'logout'});
        }
    },

    /**
     * Hide/show links
     */
    _updateLinks: function(){
        var authStatus = this.model.get("status");
        var linkVisibility = {
            ".next": authStatus == "loggedIn",
            ".prev": authStatus == "loggedIn",
            ".newbook": authStatus == "loggedIn",
            ".index": authStatus == "loggedIn",
            ".login": true // always visible; text may change
        };

        _.each(linkVisibility, function(value, key){
            $(key, this).toggle(value);
        }, this.$el);
    },

    /* event handlers*/
    askedForCredentials: function(){
        // update login link to show that credentials are being asked for
        $('a.login', this.$el).css('background-color', 'yellow').text("Login");
    },

    gotoPrev: function(event){
        event.preventDefault();
        // this.log("gotoPrev: firing navigation.prev");
        this.options.dispatcher.trigger("navigation:prev");
    },

    gotoNext: function(event){
        event.preventDefault();
        // this.log("gotoPrev: firing navigation.next");
        this.options.dispatcher.trigger("navigation:next");
    },

    loggedIn: function(){
        // update link to logout
        $('a.login', this.$el).css('background-color', '').text("Logout");
    },

    loggedOut: function(){
        $('a.login', this.$el).text("Login");
    },

    /**
     * show prev/next buttons
     */
    showGoto: function(){
        // quirky because they were hidden before being added to DOM
        // $('li.next', this.$el).add('li.prev', this.$el).show();
        $('li.next', this.$el).children().andSelf().css('display', '');
        $('li.prev', this.$el).children().andSelf().css('display', '');
    },

    /**
     * hide prev/next buttons
     */
    hideGoto: function(){
        $('li.next', this.$el).add('li.prev', this.$el).hide();
    }
});
