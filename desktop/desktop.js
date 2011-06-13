/*!
* Ext JS Library 3.3.1
* Copyright(c) 2006-2010 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

// Sample desktop configuration
MyDesktop = new Ext.ux.alvand.TokenManagementApp ({
	init : function() {
		Ext.chart.Chart.CHART_URL = '../resources/charts.swf';
		// Extend timeout for all Ext.Ajax.requests to 120 seconds.
		// Ext.Ajax is a singleton, this statement will extend the timeout
		// for all subsequent Ext.Ajax calls.
		Ext.Ajax.timeout = 150000
		Ext.QuickTips.init();

		Ext.WindowMgr.zseed = 10000;

		var cp = new Ext.state.CookieProvider({
			//			path: "/cgi-bin/",
			//			expires: new Date(new Date().getTime()+(1000*60*60*24*30)), //30 days
			//			domain: "extjs.com"
		});
		Ext.state.Manager.setProvider(cp);

		// The only requirement for this to work is that you must have a hidden field and
		// an iframe available in the page with ids corresponding to Ext.History.fieldId
		// and Ext.History.iframeId.  See history.html for an example.
		//Ext.History.init();
		// determine if we have the static flag set to true which will force data acquisition to occur from static files (easier to debug
		// since the non static version needs access to an axis2 web server connected to a safenet db.
		var staticContent = false;
		// allows for testing of invalid / valid static content to ensure that errors handling is working properly
		var validContent = true;
		var debugContent = document.location.href.indexOf('desktop-debug.html') >= 0;
		var fisheye = false;
		var paramString;
		if (document.location && document.location.href && document.location.href.indexOf('?') > -1) {
			if (document.location.href.indexOf('#') > -1)
				paramString = document.location.href.substring(document.location.href.indexOf('?') + 1, document.location.href.indexOf('#'));
			else
				paramString = document.location.href.substring(document.location.href.indexOf('?') + 1);

			// split up by & to seperate all params
			if (paramString) {
				var paramarray = paramString.split('&');
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
		// construct a global key map for shortcut support throughout the desktop
		globalKeyMap = new Ext.KeyMap(document);
		globalKeyMap.accessKey = function(key, handler, scope) {
			if(handler) {
				var h = function(n, e) {
					e.preventDefault();
					handler.call(scope || this, n, e);
				};
				this.on(key, h, scope);
			}
		};
		// construct an environment structure that is passed to all containers
		var historyDelimiter = ':';
		var staticUrl = '../alvand/data/';
		this.environ = {
			debugContent: debugContent,
			paramString: paramString,
			staticContent: staticContent,
			rootUrl: (staticContent ? staticUrl : '/axis2/services/'),
			staticUrl: staticUrl,
			validContent: validContent,
			// Needed if you want to handle history for multiple components in the same page.
			// Should be something that won't be in component ids.
			historyDelimitor: historyDelimiter,
			communicator: Ext.ux.alvand.Communicator
		}
		// load this utility singleton with the environment.  this singleton is used to store user specific token table stores.
		Ext.ux.alvand.UserTokenTableStores.setEnvironment(this.environ);
		// Handle this change event in order to restore the UI to the appropriate history state
		//		Ext.History.on('change', function(token) {
		//			if (token) {
		//				var parts = token.split(historyDelimiter);
		//				// delegate to the history dispatch to see if it can find a handler for this token
		//				Ext.ux.alvand.reghh(this, parts);
		//			}
		//		});

		// call parent initComponent
		this.loadAppDomain();
		// build menu
		if(fisheye) {
			var fme = new Ext.ux.FisheyeMenuExtention({
				renderTo : 'fisheye-menu',
				hAlign : 'center', // left|center|right
				vAlign : 'top', // top|bottom
				itemWidth : 48,
				items : [
				{
					text: 'Token Manager',
					imagePath: 'images/token48x48.png',
					onclick: 'MyDesktop.launchHelper(\'dblogins\');'
				}, {
					text: 'Animation Studio',
					imagePath: 'images/animation.png',
					onclick: 'MyDesktop.launchHelper(\'dslogins\');'
				}, {
					text: 'Todays Specials',
					imagePath: 'images/fries_img.png',
					onclick: 'MyDesktop.launchHelper(\'tokentables\');'
				}]
			});
		}

	},
	getModules : function() {
		return [
		new MyDesktop.ConfigurationMenuModule(),
		new MyDesktop.TokenManagementMenuModule(),
		new MyDesktop.PerformanceMenuModule(),
		new MyDesktop.HelpWindow(),
		new MyDesktop.LogWindow(),
		new MyDesktop.WizardWindow()
		];
	},
	launchHelper: function(subgroup) {
		if(subgroup) {
			var base = MyDesktop;
			// the module may have a subgroup.
			if(base.modules) {
				for(var y=0; y < base.modules.length; y++) {
					if(base.modules[y].launcher && base.modules[y].launcher.menu && base.modules[y].launcher.menu.items) {
						for(var x=0; x < base.modules[y].launcher.menu.items.length; x++) {
							if(base.modules[y].launcher.menu.items[x].code == subgroup) {
								base.modules[y].createWindow(base.modules[y].launcher.menu.items[x]);
								break;
							}
						}
					}
				}
			}
		}
	},
	launchFinder: function() {
		var desktop = this.getDesktop();
		var win = desktop.getWindow('finder-win');
		if(!win) {
			win = desktop.createWindow({
				id: 'finder-win',
				title:'Finder',
				width:400,
				height:300,
				iconCls: 'icon-grid',
				shim:false,
				animCollapse:false,
				constrainHeader:true,

				layout: 'fit',
				items:[
				{
					xtype: 'label',
					text: 'Coming Soon'

				}]
			});
		}
		win.show();
	},
	// config for the start menu
	getStartConfig : function() {
		return {
			title: (this.userStruct?this.userStruct.fullname:''),
			iconCls: 'user',
			toolItems: [
			{
				text:'Settings',
				iconCls:'settings',
				handler: function() {
					var desktop = this.getDesktop();
					var win = desktop.getWindow('about-win');
					if(!win) {
						win = desktop.createWindow({
							id: 'about-win',
							title:'Settings',
							width:400,
							height:300,
							iconCls: 'icon-grid',
							shim:false,
							animCollapse:false,
							constrainHeader:true,

							layout: 'fit',
							items:[
							{
								xtype: 'form',
								style: 'padding: 5px;',
								frame: true,
								border: true,
								bodyStyle: 'padding:5px 5px 0;',
								autoScroll: true,
								anchor: '-20',
								items:[
								{
									fieldLabel: 'Username',
									xtype: 'textfield',
									readOnly: true,
									value: this.environ.currentUser
								},{
									xtype: 'radiogroup',
									fieldLabel: 'UI Style',
									listeners:{
										'render': function(rg){
											var val = (MyDesktop.environ.uiStyle?MyDesktop.environ.uiStyle:'windows');
											if(val){
												rg.setValue(val);
											}
										},
										'change': function(rg, checked){
											if(checked.getValue()){
												MyDesktop.environ.uiStyle = rg.getValue().inputValue;
												Ext.state.Manager.set(MyDesktop.environ.currentUser + '_alvand_uistyle', MyDesktop.environ.uiStyle);
											}
										}	
									},
									items: [{
										boxLabel: 'Windows',
										name: 'uistyle',
										inputValue: 'windows',
										scope: this
									}, {
										boxLabel: 'Mac',
										name: 'uistyle',
										inputValue: 'mac',
										scope: this
									}]
								}
								]
							}]
						});
					}
					win.show();
				},
				scope:this
			},'-',
			{
				text:'Logout',
				iconCls:'logout',
				handler: function() {
					document.location.href  = 'login'+(this.environ.debugContent?'-debug':'')+'.html' +(this.environ.paramString && this.environ.paramString.length > 0?'?'+this.environ.paramString:'');
				},
				scope:this
			},'-',{
				text:'About',
				iconCls:'alv-log-info',
				tooltip: 'about this Alvand Solutions product...',
				handler: function() {
					var desktop = this.getDesktop();
					var win = desktop.getWindow('about-win');
					if(!win) {
						win = desktop.createWindow({
							id: 'about-win',
							title:'About This Product',
							width:400,
							height:300,
							iconCls: 'icon-grid',
							shim:false,
							animCollapse:false,
							constrainHeader:true,

							layout: 'fit',
							items:[
							{
								xtype: 'alviframe',
								url: '/help/about.html'

							}]
						});
					}
					win.show();
				},
				scope:this
			}]
		};
	}
});

/*
 * Example windows
 */
MyDesktop.HelpWindow = Ext.extend(Ext.app.Module, {
	id:'help-win',
	init : function() {
		this.launcher = {
			text: 'Help Library',
			iconCls:'alv-book',
			handler : this.createWindow,
			scope: this
		}
	},
	createWindow : function(ttConfig) {
		var base = MyDesktop;
		var desktop = base.getDesktop();
		var win = desktop.getWindow('help-win');
		if(!win) {
			win = desktop.createWindow({
				id: 'help-win',
				stateful: true,
				stateId: 'help-win',
				title:'Help Library',
				width:700,
				height:600,
				iconCls: 'icon-grid',
				shim:false,
				animCollapse:false,
				constrainHeader:true,

				layout: 'fit',
				items:
				new Ext.ux.alvand.HelpPanel({
					//id: this.id + '_helpPanel',
					xtype: 'alvhelp',
					environ: base.environ,
					collapsible: false,
					collapsed: false
				})
			});
		}
		win.show();
		if(ttConfig) {
			ttConfig.target = win.el.id;
			ttConfig.windowId = win.id;
		}
	}
});

MyDesktop.LogWindow = Ext.extend(Ext.app.Module, {
	id:'log-win',
	init : function() {
		this.launcher = {
			text: 'Log Viewer',
			iconCls:'x-icon-tables',
			handler : this.createWindow,
			scope: this
		}
	},
	createWindow : function(ttConfig) {
		var base = MyDesktop;
		var desktop = base.getDesktop();
		var win = desktop.getWindow('log-win');
		// allow multiwindow
		//		if(!win) {
		win = desktop.createWindow({
			id: 'log-win' + '_' + base.environ.communicator.guid(),
			//				id: 'log-win',
			stateful: true,
			stateId: 'log-win',
			title:'Log Viewer',
			width:700,
			height:600,
			iconCls: 'icon-grid',
			shim:false,
			animCollapse:false,
			constrainHeader:true,

			layout: 'fit',
			items:
			new Ext.ux.alvand.LogViewer({
				environ: base.environ,
				collapsible: false,
				collapsed: false
			})
		});
		//		}
		win.show();
		if(ttConfig) {
			ttConfig.target = win.el.id;
			ttConfig.windowId = win.id;
		}
	}
});

MyDesktop.WizardWindow = Ext.extend(Ext.app.Module, {
	id:'wizard-win',
	init : function() {
		this.launcher = {
			text: 'Feature Walk-thru',
			iconCls:'x-icon-tables',
			handler : this.createWindow,
			scope: this
		}
	},
	createWindow : function() {
		//var desktop = this.app.getDesktop();
		//var win = desktop.getWindow('wizard-win');
		Ext.ux.alvand.WizardItinaryManager.start('overview');
	}
});

// for example purposes
var windowIndex = 0;

MyDesktop.TokenManagementModule = Ext.extend(Ext.app.Module, {
	init : function() {
		this.launcher = {
			text: 'Window '+(++windowIndex),
			iconCls:'bogus',
			handler : this.createWindow,
			scope: this,
			windowId:windowIndex
		}
	},
	createWindow : function(src, ttConfig) {
		var base = MyDesktop;
		var desktop = base.getDesktop();
		var win = desktop.getWindow(src.code + '_'+src.windowId);
		if(!win) {
			win = desktop.createWindow({
				id: src.code + '_'+src.windowId,
				stateful: true,
				stateId: src.code + '_'+src.windowId,
				title:src.text,
				width:480,
				height:605,
				iconCls: src.iconCls,
				shim:false,
				animCollapse:false,
				constrainHeader:true,

				layout: 'fit',
				items:[src.windowContents(this)]
			});
		}
		win.show();
		if(ttConfig) {
			ttConfig.target = win.el.id;
			ttConfig.windowId = win.id;
		}
	}
});

MyDesktop.TokenManagementMenuModule = Ext.extend(MyDesktop.TokenManagementModule, {
	init : function() {
		this.launcher = {
			text: 'Token Management',
			iconCls: 'x-icon-tickets',
			handler: function() {
				return false;
			},
			menu: {
				items:[{
					code: 'createtoken',
					text: 'Create',
					iconCls:'x-icon-tickets',
					handler : this.createWindow,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						return {
							xtype: 'alvformcreatetoken',
							environ: scope.app.environ,
							dbUserStore: scope.app.dbLoginStore(),
							naeUserstore: scope.app.hsmLoginStore(),
							tokentablestore: scope.app.tokenTableStore()
						};
					}
				},{
					code:'redeemtoken',
					text: 'Redeem',
					iconCls:'x-icon-subscriptions',
					handler : this.createWindow,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						return {
							xtype: 'alvformredeemtoken',
							environ: scope.app.environ,
							dbUserStore: scope.app.dbLoginStore(),
							naeUserstore: scope.app.hsmLoginStore(),
							tokentablestore: scope.app.tokenTableStore()
						};
					}
				},{
					code: 'deletetoken',
					text: 'Delete',
					iconCls:'x-icon-delete',
					handler : this.createWindow,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						return {
							xtype: 'alvformdeletetoken',
							environ: scope.app.environ,
							dbUserStore: scope.app.dbLoginStore(),
							naeUserstore: scope.app.hsmLoginStore(),
							tokentablestore: scope.app.tokenTableStore()
						};
					}
				}]
			}
		}
	}
});

MyDesktop.ConfigurationModule = Ext.extend(Ext.app.Module, {
	init : function() {
		this.launcher = {
			text: 'Window '+(++windowIndex),
			iconCls:'bogus',
			handler : this.createWindow,
			scope: this,
			windowId:windowIndex
		}
	},
	createWindow : function(src, ttConfig) {
		var base = MyDesktop;
		var desktop = base.getDesktop();
		var win;
		// multiwindow support allows for multiple of the same type of window to open.
		if(!src.multiWindow)
			win = desktop.getWindow(src.code +'_'+src.windowId);
		if(!win) {
			win = desktop.createWindow({
				id: src.code + '_'+src.windowId + (src.multiWindow?'_'+base.environ.communicator.guid():''),
				stateful: true,
				stateId: src.code + '_'+src.windowId,
				title:src.text,
				width:(src.width?src.width:540),
				height:(src.height?src.height:300),
				iconCls: src.iconCls,
				shim:false,
				animCollapse:false,
				constrainHeader:true,

				layout: 'fit',
				items:[src.windowContents(this)]
			});
		}
		win.show();
		if(ttConfig) {
			ttConfig.target = win.el.id;
			ttConfig.windowId = win.id;
		}
	}
});

MyDesktop.ConfigurationMenuModule = Ext.extend(MyDesktop.ConfigurationModule, {
	init : function() {
		this.launcher = {
			text: 'Configuration',
			iconCls: 'alv-gears',
			handler: function() {
				return false;
			},
			menu: {
				items:[{
					code: 'dblogins',
					text: 'Token Manager',
					multiWindow: false,
					iconCls:'x-icon-users',
					handler : this.createWindow,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						return {
							xtype: 'alviframe',
							anchor: '-20',
							environ: scope.app.environ,
							url:'http://localhost/TokenManager/ext/desktop/login-debug.html?static=true'
						};
					}
				},{
					code:'dslogins',
					text: 'Animation Studio',
					iconCls:'x-icon-users',
					handler : this.createWindow,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						return {
                            xtype: 'alviframe',
                            anchor: '-20',
                            environ: scope.app.environ,
                            url:'http://localhost/LostCoastStudios/animationstudio/www/index.html'
						};
					}
				},{
					code: 'tokentables',
					text: 'Todays Specials',
					iconCls:'x-icon-tables',
					handler : this.createWindow,
					width:734,
					height:300,
					multiWindow: true,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						var gridId = scope.app.environ.communicator.guid();
						return {
                            xtype: 'alviframe',
                            anchor: '-20',
                            environ: scope.app.environ,
                            url:'http://localhost/ProximitySolutions/proximitysolutions/ManagementConsole/www/index.html'
                        };
					}
				}]
			}
		}
	}
});

MyDesktop.PerformanceModule = Ext.extend(Ext.app.Module, {
	init : function() {
		this.launcher = {
			text: 'Window '+(++windowIndex),
			iconCls:'bogus',
			handler : this.createWindow,
			scope: this,
			windowId:windowIndex
		}
	},
	createWindow : function(src, ttConfig) {
		var base = MyDesktop;
		var desktop = base.getDesktop();
		var win;
		// multiwindow support allows for multiple of the same type of window to open.
		if(!src.multiWindow)
			win = desktop.getWindow(src.code +'_'+src.windowId);
		if(!win) {
			win = desktop.createWindow({
				id: src.code + '_'+src.windowId + (src.multiWindow?'_'+base.environ.communicator.guid():''),
				stateful: true,
				stateId: src.code + '_'+src.windowId,
				title:src.text,
				width:(src.width?src.width:795),
				height:(src.height?src.height:510),
				iconCls: src.iconCls,
				shim:false,
				animCollapse:false,
				constrainHeader:true,

				layout: 'fit',
				items:[src.windowContents(this)]
			});
		}
		win.show();
		if(ttConfig) {
			ttConfig.target = win.el.id;
			ttConfig.windowId = win.id;
		}
	}
});

MyDesktop.PerformanceMenuModule = Ext.extend(MyDesktop.PerformanceModule, {
	init : function() {
		this.launcher = {
			text: 'Performance',
			iconCls: 'alv-gears',
			handler: function() {
				return false;
			},
			menu: {
				items:[{
					code: 'perfquicktest',
					text: 'Quick Test',
					multiWindow: false,
					iconCls:'x-icon-users',
					handler : this.createWindow,
					scope: this,
					windowId: windowIndex,
					windowContents: function(scope) {
						return {
							xtype: 'alvformquicktest',
							environ: scope.app.environ,
							dbUserStore: scope.app.dbLoginStore(),
							naeUserstore: scope.app.hsmLoginStore(),
							tokentablestore: scope.app.tokenTableStore()
						};
					}
				}]
			}
		}
	}
});

