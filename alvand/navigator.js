Ext.namespace('Ext.ux.alvand');
/**
 * @class Ext.ux.alvand.Navigator
 * @extends Ext.Viewport
 * Main Navigation Container for the safenet administration console
 * @cfg {Object} environ An environment structure containing connection information and utility objects to obtain data and configure stores.
 * @constructor
 * Create a new navigator
 * @param {Object} environ The environment object
 * @xtype alvnavigator
 */
Ext.ux.alvand.Navigator = Ext.extend(Ext.Viewport, {
	requestType:'getTokenTableList',
	xtype: 'alvnavigator',
	environ: {},
	layout: 'border',
	listeners: {
		'render': function(nav) {
			// we will use the render event to initiate data load of the tokenized tables as well
			// as partial information (usernames) to populate the dbUser table with
			Ext.Ajax.request({
				url: (this.environ.staticContent?this.environ.staticUrl + 'tokenizedtables2_valid.txt':'/axis2/services/SafenetTokenManagement/getTokenTableList?response=application/json/badgerfish'),
				method: 'POST',
				success: this.dataLoadSuccess,
				failure: this.environ.communicator.dataLoadFailure,
				params: this.environ.authUser,
				scope: this
			});
		}
	},
	processResultObject: function(resultData, resultObj) {
		if(resultObj['ax23:status'] && resultObj['ax23:status']['ax23:statusCode'] && resultObj['ax23:status']['ax23:statusCode']['$']) {
			var statusCode = resultObj['ax23:status']['ax23:statusCode']['$'];
			var statusDescription
			if(resultObj['ax23:status'] && resultObj['ax23:status']['ax23:statusDescription'] && resultObj['ax23:status']['ax23:statusDescription']['$']) {
				var statusDescription = resultObj['ax23:status']['ax23:statusDescription']['$'];
			}

			// check to see if we have the submitted value
			var tableKeyArray = resultObj['ax23:tableKeyArray'];
			if(tableKeyArray) {
				for(var i = 0; i < tableKeyArray.length; i++) {
					var tableKeyRecord = {};

					if(tableKeyArray[i]['ax23:tableName'] && tableKeyArray[i]['ax23:tableName']['$']) {
						tableKeyRecord.tableName = tableKeyArray[i]['ax23:tableName']['$'];
					}
					if(tableKeyArray[i]['ax23:hmacKey'] && tableKeyArray[i]['ax23:hmacKey']['$']) {
						tableKeyRecord.hmacKey = tableKeyArray[i]['ax23:hmacKey']['$'];
					}
					if(tableKeyArray[i]['ax23:encryptionKey'] && tableKeyArray[i]['ax23:encryptionKey']['$']) {
						tableKeyRecord.encryptionKey = tableKeyArray[i]['ax23:encryptionKey']['$'];
					}
					resultData.push(tableKeyRecord);
				}
			}
		} else {
			// result was retrieved successfully but the server report failure
			Ext.Msg.show({
				title: 'No Status in response',
				msg: 'There is no status object in the return structure.',
				buttons: Ext.Msg.OK,
				animEl: 'elId',
				icon: Ext.MessageBox.ERROR
			});
		}
		return resultData;
	},
	dataLoadSuccess: function(result, request) {
		// inspect the json response container to verify that the result was successful and no errors were present
		try {
			if (result && result.responseText) {
				var rObj = Ext.decode(result.responseText);
				if (this.environ.communicator.responseCheck2(rObj, request, this.requestType+'Response')) {
					// TODO: adapt response batch to grid loadable data
					var resultData = new Array();
					var resultObj = rObj['ns:'+this.requestType+'Response']['ns:return'];
					if(resultObj) {
						if(Ext.isArray(resultObj)) {
							for(var i = 0; i < resultObj.length; i++) {
								this.processResultObject(resultData, resultObj[i]);
							}
						}
						else{
								this.processResultObject(resultData, resultObj);							
						}
					}
					this.tokenTableStore().loadData({data:resultData});
				}
			} else {
				// result was retrieved successfully but the server report failure
				Ext.Msg.show({
					title: 'Server Error',
					msg: 'An error occurred attempting to ajax load data from the server.  No result was obtained',
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
			}
		} catch (exc) {
			// if an exception occurred, then raise it and fail the response check
			Ext.Msg.show({
				title: 'Critical Error',
				msg: exc,
				buttons: Ext.Msg.OK,
				animEl: 'elId',
				icon: Ext.MessageBox.ERROR
			});
			return false;
		}
	},
	dataLoadSuccessOld: function(result, request) {
		// inspect the json response container to verify that the result was successful and no errors were present
		try {
			var rObj = this.environ.communicator.getResponseObject(result);
			if (this.environ.communicator.responseCheck(rObj, request)) {
				this.tokenTableStore().loadData((rObj.data ? {
						data: rObj.data
					} : {
						data: []
					}));
				// for all dbUser usernames obtained, enter those into the db login store
				var dbUsers = new Array();
				for (var i = 0; i < rObj.data.length; i++) {
					var dbUser = {
						username: rObj.data[i].dbUser,
						password: ''
					};
					if (dbUsers.indexOf(dbUser) == -1)
						dbUsers.push(dbUser);
				}
				this.dbLoginStore().loadData({
					data: dbUsers
				});
			}

		} catch (exc) {
			// if an exception occurred, then raise it and fail the response check
			Ext.Msg.show({
				title: 'Critical Error',
				msg: exc,
				buttons: Ext.Msg.OK,
				animEl: 'elId',
				icon: Ext.MessageBox.ERROR
			});
			return false;
		}
	},
	initComponent: function() {

		// construct a store for the db logins and hsm logins
		this.dbUserStore = new Ext.data.Store({
			reader: new Ext.data.JsonReader({
				root: 'data',
				idProperty: 'username',
				storeId: this.id + '_dbStore'
			}, [{
				name: 'username'
			}, {
				name: 'password'
			}])
		});

		this.naeUserstore = new Ext.data.Store({
			reader: new Ext.data.ArrayReader({}, [{
				name: 'username'
			}, {
				name: 'password'
			}])
		});

		this.tokentablestore = new Ext.data.JsonStore({
			// store configs
			autoDestroy: true,
			url: (this.environ.staticContent?this.environ.staticUrl + 'tokenizedtables2_valid.txt':'/axis2/services/SafenetTokenManagement/getTokenTableList?response=application/json/badgerfish'),
			storeId: this.id + '_ttStore',
			// reader configs
			root: 'data',
			idProperty: 'tableName',
			fields: [ //	{
			//        name: 'id'
			//    },
			{
				name: 'tableName'
			}, {
				name: 'hmacKey'
			}, {
				name: 'encryptionKey'
			}, {
				name: 'dbUser'
			}, {
				name: 'sequential',
				type: 'boolean'
			}, {
				name: 'datalength',
				type: 'int'
			}, {
				name: 'record_deleted',
				type: 'boolean'
			}, {
				name: 'record_new',
				type: 'boolean'
			}]
		});

		this.items = [];
		this.items.push({
			region: 'north',
			html: '<img src="images/logo.gif" width="90" height="32" style="margin-left:2px;margin-top: 2px; margin-bottom:2px;margin-right:2px;" align="left"/><div class="alv-banner"></div>'
		}, {
			region: 'center',
			xtype: 'grouptabpanel',
			tabWidth: 160,
			activeGroup: 0,
			listeners: {
				'tabchange': function(tabPanel, tab) {
					var navigator = tabPanel.ownerCt;
					/* Concept of a history combo in the south region of the navigator to jump to a particular location in history.
 					var historyStore = Ext.ux.alvand.HistoryDispatch.getStore();
 					if (historyStore) {
 					var HistoryRecord = Ext.data.Record.create([
 					{
 					name: 'history'
 					}, {
 					name: 'historyindex'
 					}]);

 					// create Record instance
 					var newHistoryRecord = new HistoryRecord({
 					history: tab.title,
 					historyIndex: historyStore.getCount()
 					}
 					);
 					historyStore.add(newHistoryRecord);
 					}
 					*/
					Ext.History.add(navigator.xtype + navigator.environ.historyDelimitor + tabPanel.id + navigator.environ.historyDelimitor + tab.id);
				}
			},
			items: [{
				mainItem: 1,
				items: [{
					xtype: 'alvformcreatetoken',
					cls: 'x-alv-panel',
					environ: this.environ,
					navigatorId: this.id,
					dbUserStore: this.dbLoginStore(),
					naeUserstore: this.hsmLoginStore(),
					tokentablestore: this.tokenTableStore()
				}, {
					title: 'Token Management',
					cls: 'x-alv-panel',
					tabTip: 'Management functionality for tokens',
					closable: true,
					style: 'padding: 5px;',
					layout: 'fit',
					items: [{
						xtype: 'alviframe',
						environ: this.environ,
						url: '/splash/tm/index.html'
					}]
				}, {
					xtype: 'alvformredeemtoken',
					cls: 'x-alv-panel',
					environ: this.environ,
					navigatorId: this.id,
					dbUserStore: this.dbLoginStore(),
					naeUserstore: this.hsmLoginStore(),
					tokentablestore: this.tokenTableStore()
				}, {
					xtype: 'alvformdeletetoken',
					cls: 'x-alv-panel',
					environ: this.environ,
					navigatorId: this.id,
					dbUserStore: this.dbLoginStore(),
					naeUserstore: this.hsmLoginStore(),
					tokentablestore: this.tokenTableStore()
				}]
			}, {
				expanded: true,
				items: [{
					title: 'Configuration',
					cls: 'x-alv-panel',
					iconCls: 'x-icon-configuration',
					tabTip: 'Configuration tabtip',
					style: 'padding: 5px;',
					closable: true,
					layout: 'fit',
					items: [{
						xtype: 'alviframe',
						environ: this.environ,
						url: '/splash/cfg/index.html'
					}]
				}, {
					title: 'Database Logins',
					cls: 'x-alv-panel',
					id: this.id + '_dbUsers',
					iconCls: 'x-icon-users',
					tabTip: 'Manage Database Logins',
					layout: 'fit',
					style: 'padding: 5px;',
					items: [{
						title: 'Database Logins',
						layout: 'fit',
						iconCls: 'x-icon-users',
						tabTip: 'Database Logins',
						items: [{
							xtype: 'alvgriddblogin',
							anchor: '-20',
							environ: this.environ,
							store: this.dbLoginStore(),
						}]
					}]
				}, {
					title: 'DataSecure Logins',
					cls: 'x-alv-panel',
					id: this.id + '_naeUsers',
					iconCls: 'x-icon-users',
					tabTip: 'Manage DataSecure Logins',
					layout: 'fit',
					style: 'padding: 5px;',
					items: [{
						title: 'DataSecure Logins',
						layout: 'fit',
						iconCls: 'x-icon-users',
						tabTip: 'DataSecure Logins',
						items: [{
							xtype: 'alvgriddblogin',
							anchor: '-20',
							environ: this.environ,
							store: this.hsmLoginStore(),
						}]
					}]
				}, {
					title: 'Tokenized Tables',
					cls: 'x-alv-panel',
					id: this.id + '_tokentables',
					iconCls: 'x-icon-tables',
					tabTip: 'Managed Tokenized Tables',
					layout: 'fit',
					style: 'padding: 5px;',
					items: [{
						title: 'Tokenized Tables',
						layout: 'fit',
						iconCls: 'x-icon-tables',
						tabTip: 'Tokenized Tables',
						items: [{
							xtype: 'alvgridtokentables',
							anchor: '-20',
							environ: this.environ,
							dbUserStore: this.dbLoginStore(),
							store: this.tokenTableStore(),
							navigatorId: this.id
						}]
					}]
				}]
			}]
		}, {
			region: 'south',
			buttons: [{
				//		Concept of a history combo to navigate to particular location in history
				//          displayField: 'history',
				//          typeAhead: true,
				//          mode: 'local',
				//          triggerAction: 'all',
				//          emptyText: 'History...',
				//          selectOnFocus: true,
				//          xtype: 'combo',
				//          store: Ext.ux.alvand.HistoryDispatch.getStore(),
				//          allowBlank: true
				//      }, {
				id: 'forward_one_click',
				html: '<div class="x-icon-alv-forward">Forward</div>',
				hidden: false,
				handler: function(btn, event) {
					// go back one in history to return to next screen in history.
					Ext.History.forward();
				}
			}, {
				id: 'back_one_click',
				html: '<div class="x-icon-alv-back">Back</div>',
				hidden: false,
				handler: function(btn, event) {
					// go back one in history to return to previous screen.
					Ext.History.back();
				}
			}, {
				id: 'help_click',
				html: '<div class="x-icon-alv-info">Help</div>',
				hidden: false,
				enableToggle: true,

				toggleHandler: function(btn, state) {
					var helpPanel = Ext.getCmp(this.id + '_helpPanel');
					if (helpPanel) {
						if (helpPanel.collapsed) {
							// expand help
							helpPanel.expand(true);
						} else {
							// collapse help
							helpPanel.collapse(true);
						}
					}
				},
				scope: this
			}]
		}, {
			id: this.id + '_helpPanel',
			xtype: 'alvhelp',
			environ: this.environ
		});

		// call parent initComponent
		Ext.ux.alvand.Navigator.superclass.initComponent.call(this);

	},
	dbLoginStore: function() {
		return this.dbUserStore;
	},
	hsmLoginStore: function() {
		return this.naeUserstore;
	},
	tokenTableStore: function() {
		return this.tokentablestore;
	},
	/**
 	* Activate the link to load the login form.
 	* @param {String} loginType the type of login screen to load. This may be:
 	* @param {Boolean} referral bool to indicate if this request to route to another form is a referral that should allow for visual return button when finished
 	*
 	String : A value of DB or HSM
 	*
 	*/
	displayLoginForm: function(loginType, referral) {
		// determine if this is a db login form or an hsm login form that needs to be loaded.
		var dblId = loginType == 'DB' ? '_dbUsers' : '_naeUsers';
		var dbl = Ext.getCmp(this.id + dblId);
		dbl.ownerCt.ownerCt.setActiveGroup(dbl.ownerCt);
		dbl.ownerCt.setActiveTab(dbl);
	},
	displayTokenTableForm: function() {
		var dbl = Ext.getCmp(this.id + '_tokentables');
		dbl.ownerCt.ownerCt.setActiveGroup(dbl.ownerCt);
		dbl.ownerCt.setActiveTab(dbl);
	}
});

// register xtype
Ext.reg('alvnavigator', Ext.ux.alvand.Navigator);

// register history dispatch
Ext.ux.alvand.regh('alvnavigator', function(parts) {
	// assumption is that an xtype plus at least one value is needed so, we will check for 2 or more
	if (parts.length >= 2) {
		//var tabPanel = Ext.getCmp(parts[0]);
		var tabId = parts[1];
		// get the tab
		var tab = Ext.getCmp(tabId);
		tab.ownerCt.ownerCt.setActiveGroup(tab.ownerCt);
		tab.ownerCt.setActiveTab(tab);
	}
});
// end of file

