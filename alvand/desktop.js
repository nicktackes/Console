/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.onReady(function(){
    Ext.QuickTips.init();
    
    // The only requirement for this to work is that you must have a hidden field and
    // an iframe available in the page with ids corresponding to Ext.History.fieldId
    // and Ext.History.iframeId.  See history.html for an example.
    Ext.History.init();
    
    // determine if we have the static flag set to true which will force data acquisition to occur from static files (easier to debug
    // since the non static version needs access to an axis2 web server connected to a safenet db.
    var staticContent = false;
    if (this.location.href.indexOf('?') > -1) {
        var paramstring;
        if (this.location.href.indexOf('#') > -1) 
            paramstring = this.location.href.substring(this.location.href.indexOf('?') + 1, this.location.href.indexOf('#'));
        else 
            paramstring = this.location.href.substring(this.location.href.indexOf('?') + 1);
        
        // split up by & to seperate all params
        if (paramstring) {
            var paramarray = paramstring.split('&');
            if (paramarray) {
                for (var i = 0; i < paramarray.length; i++) {
                    var param = paramarray[i].split('=');
                    if (param && param.length == 2) {
                        if (param[0] == 'static' && param[1] == 'true') 
                            staticContent = true;
                    }
                }
            }
        }
    }
    // construct a global key map for shortcut support throughout the desktop
    globalKeyMap = new Ext.KeyMap(document);
    globalKeyMap.accessKey = function(key, handler, scope){
        var h = function(n, e){
            e.preventDefault();
            handler.call(scope || this, n, e);
        };
        this.on(key, h, scope);
    };
    
    // construct an environment structure that is passed to all containers
    var historyDelimiter = ':';
	var staticUrl = '/ext/alvand/data/';
    var environ = {
        staticContent: staticContent,
        rootUrl: (staticContent ? staticUrl : '/axis2/services/'),
		staticUrl: staticUrl,
        // Needed if you want to handle history for multiple components in the same page.
        // Should be something that won't be in component ids.
        historyDelimitor: historyDelimiter,
        communicator: Ext.ux.alvand.Communicator
    }
    
    var viewport = new Ext.ux.alvand.Navigator({
        hidden: false,
        environ: environ
    });
    
    // Handle this change event in order to restore the UI to the appropriate history state
    Ext.History.on('change', function(token){
        if (token) {
            var parts = token.split(historyDelimiter);
            // delegate to the history dispatch to see if it can find a handler for this token
            Ext.ux.alvand.reghh(this, parts);
        }
    });
    
    // create a login form and window
    var loginForm = new Ext.FormPanel({
        labelWidth: 80,
		// TODO: implement servlet handler of authentication.  for now, every request succeeds
        url: '/ext/alvand/data/login_valid.txt', 
        frame: true,
        title: 'Authentication',
        defaultType: 'textfield',
        monitorValid: true,
        items: [{
            fieldLabel: 'Username',
            name: 'loginUsername',
            allowBlank: false
        }, {
            fieldLabel: 'Password',
            name: 'loginPassword',
            inputType: 'password',
            allowBlank: false
        }],
        
        buttons: [{
            text: 'Login',
            formBind: true,
            // Function that fires when user clicks the button 
            handler: function(){
                loginForm.getForm().submit({
                    method: 'POST',
                    waitTitle: 'Connecting',
                    waitMsg: 'Sending data...',
                    
                    success: function(){
							loginForm.ownerCt.close();
                    },
                    
                    failure: function(form, action){
                        if (action.failureType == 'server') {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Login Failed!', obj.errors.reason);
                        }
                        else {
                            Ext.Msg.alert('Warning!', 'Authentication server is unreachable : ' + action.response.responseText);
                        }
                        loginForm.getForm().reset();
                    }
                });
            }, scope: this
        }]
    });
    
    var loginWin = new Ext.Window({
        layout: 'fit',
        width: 300,
        height: 150,
        closable: false,
        resizable: false,
        plain: true,
        border: false,
		modal: true,
        items: [loginForm]
    });
	//viewport.hide();
    loginWin.show();
    
});
