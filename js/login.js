/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.onReady( function() {
	Ext.QuickTips.init();
		var cp = new Ext.state.CookieProvider({
			//			path: "/cgi-bin/",
			//			expires: new Date(new Date().getTime()+(1000*60*60*24*30)), //30 days
			//			domain: "extjs.com"
		});
		Ext.state.Manager.setProvider(cp);

	var staticContent = false;
	// allows for testing of invalid / valid static content to ensure that errors handling is working properly
	var validContent = true;
	var debugContent = document.location.href.indexOf('login-debug.html') >= 0;
	var fisheye = false;
	if (document.location && document.location.href && document.location.href.indexOf('?') > -1) {
		var paramstring;
		if (document.location.href.indexOf('#') > -1)
			paramstring = document.location.href.substring(document.location.href.indexOf('?') + 1, document.location.href.indexOf('#'));
		else
			paramstring = document.location.href.substring(document.location.href.indexOf('?') + 1);

		// split up by & to seperate all params
		if (paramstring) {
			var paramarray = paramstring.split('&');
			if (paramarray) {
				for (var i = 0; i < paramarray.length; i++) {
					var param = paramarray[i].split('=');
					if (param && param.length == 2) {
						if (param[0] == 'static' && param[1] == 'true')
							staticContent = true;
						else if (param[0] == 'valid' && param[1] == 'false')
							validContent = false;
						else if (param[0] == 'fisheye' && param[1] == 'true')
							fisheye = true;
					}
				}
			}
		}
	}
	// TODO: implement actual passthrough to server
	//var loginUrl = (staticContent?'/ext/alvand/data/login_valid.txt':'axis server link here');
	var loginUrl = '../../examples/console/data/login_valid.txt';

	// create a login form and window
	var loginForm = new Ext.FormPanel({
		labelWidth: 80,
		// TODO: implement servlet handler of authentication.  for now, every request succeeds
		url: loginUrl,
		frame: true,
		title: 'Authentication',
		defaultType: 'textfield',
		monitorValid: true,
		items: [{
			id:'alvusername',
			fieldLabel: 'Username',
			name: 'loginUsername',
			allowBlank: false
		}, {
			id:'alvpassword',
			fieldLabel: 'Password',
			name: 'loginPassword',
			inputType: 'password',
			allowBlank: false
		}, {
			id: 'loginStatus',
			name: 'loginStatus',
			xtype: 'label',
			hidden: true,
			//cls: 'x-form-item x-save-status-failure ',
			style: ' color: red;',
			text: 'Authentication Failed.  Please try again.'
		}],
		listeners:{
			'show': function(form) {
				var fld = form.getForm().findField('alvusername');
				if(fld) {
					fld.focus.defer(100, fld, [true, true]);
				}
			},
			'afterrender': function(form) {
				var fld = form.getForm().findField('alvusername');
				if(fld) {

					var tip = new Ext.ToolTip({
						//target: form.el.id,
						html: 'You can log in without requiring the mouse.  Enter your username and tab to the password field, then hit the enter key to authenticate.',
						title: 'Tips',
						autoHide: true,
						dismissDelay: 20000
					});
					tip.showAt.defer(3000, tip,form.getEl().getXY());
					fld.focus.defer(100, fld, [true, true]);
				}
				var nav = new Ext.KeyNav(form.getForm().getEl(), {
					'enter': function(e) {
						this.buttons[0].fireEvent('click', this.buttons[0]);
					}, scope: this
				});
			}
		},
		buttons: [{
			text: 'Login',
			formBind: true,
			listeners:{
				'click': function(btn, e) {
					btn.handler();
				}
			},
			// Function that fires when user clicks the button
			handler: function() {
				if(loginForm.getForm().isValid()) {
					loginForm.getForm().submit({
						method: 'POST',
						waitTitle: 'Connecting',
						waitMsg: 'Sending data...',

						success: function(form, action) {
							var success = false;
							var obj = Ext.util.JSON.decode(action.response.responseText);
							// get valid users
							for(var i = 0; i < obj.users.length; i++) {
								if(obj.users[i].name == form.getValues()['loginUsername']) {
									//TODO: add as cookie to simulate post until server can host
									Ext.util.Cookies.set('loginUsername',form.getValues()['loginUsername']);
									Ext.util.Cookies.set('loginPassword',form.getValues()['loginPassword']);
									success = true;
									break;
								}

							}
							if(success) {
								var uiStyle = Ext.state.Manager.get(form.getValues()['loginUsername'] + '_alvand_uistyle', 'windows');
								//loginForm.ownerCt.close();
								fisheye = (uiStyle=='mac');
								var extraParams = '';
								//if(staticContent) {
								extraParams = '?static='+ (staticContent?'true':'false') + '&valid=' + (validContent?'true':'false') + '&fisheye=' + (fisheye?'true':'false');
								//}
								document.location.href = 'desktop' + (fisheye?'-fisheye':(debugContent?'-debug':'')) + '.html' + extraParams;
							} else {
								Ext.getCmp('loginStatus').show();
								var fld = Ext.getCmp('alvusername');
								if(fld) {
									fld.focus(true, true);
								}
							}

						},
						failure: function(form, action) {
							var noResponseText = 'No details provided from the server.  Please contact your system administrator.';
							if (action.failureType == 'server') {
								var obj = {
									errors:{
										reason: noResponseText
									}
								};
								if(action && action.response && action.response.responseText)
									obj = Ext.util.JSON.decode(action.response.responseText);
								Ext.Msg.alert('Login Failed!', (obj && obj.errors && obj.errors.reason?obj.errors.reason:noResponseText));
							} else {
								Ext.Msg.alert('Warning!', 'Authentication server is unreachable : ' + (action && action.response && action.response.responseText ?action.response.responseText:noResponseText));
							}

							var fld = Ext.getCmp('alvusername');
							if(fld) {
								fld.focus(true, true);
							}
						}
					});
				}
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
