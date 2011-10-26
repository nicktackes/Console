// create namespace
Ext.namespace('ext.ux.lc.grid');

/**
 * ext.ux.lc.grid.DBLogin Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.grid.DBLogin
 * @extends Ext.grid.EditorGridPanel
 */
ext.ux.lc.grid.DBLogin = Ext.extend(Ext.grid.EditorGridPanel, {
	requireAuthentication: true,
	addText: '<span class="underline-shortcut">A</span>dd',
	autoExpandColumn: 'username',
	height: 250,
	clicksToEdit: 1,
	frame: true,
	addItem: function() {
		//		if (this.getContainerTab().id == this.getContainerTabPanel().activeTab.id) {
		//TODO: need to perform only if this window is active
		/*
		var tb = this.getTopToolbar();
		var firstItem = tb.items.items[0];
		if (firstItem) {
		firstItem.handler.call(firstItem.scope || firstItem, firstItem);
		}
		*/
		//		}
	},
	deleteItem: function() {
		//TODO: need to perform only if this window is active
		/*
		var tb = this.getTopToolbar();
		var firstItem = tb.items.items[1];
		if (firstItem) {
			firstItem.handler.call(firstItem.scope || firstItem, firstItem);
		}
		*/
	},
	authenticateItem: function() {
		//TODO: need to perform only if this window is active
		/*
		var tb = this.getTopToolbar();
		var firstItem = tb.items.items[2];
		if (firstItem) {
			firstItem.handler.call(firstItem.scope || firstItem, firstItem);
		}
		*/
	},
	getContainerTab: function() {
		return this.ownerCt.ownerCt;
	},
	getContainerTabPanel: function() {
		return this.ownerCt.ownerCt.ownerCt;
	},
	authenticateUser: function(record) {
		var username = record.get('username');
		var password = record.get('password');
		// TODO add real url to server.
		var loginUrl = '/ext/alvand/data/login_valid.txt';
		Ext.Ajax.request({
			url: loginUrl,
			success: function(response, request) {
				var success = false;
				var obj = Ext.util.JSON.decode(response.responseText);
				// get valid users
				for(var i = 0; i < obj.users.length; i++) {
					if(username == obj.users[i].name) {
						success = true;
						break;
					}

				}
				if(success) {
					// modify the value of the row to successful authentication
					record.set('loggedin', 1);
					ext.ux.lc.UserTokenTableStores.register(record.get('username'), record.get('password'));

				} else {
					record.set('loggedin', 0);

				}
				// commit the change (removes dirty flag):
				record.commit();

			},
			failure: function(response, request) {
				// TODO: provide ability to modify the tooltip on failure of authentication
				record.set('loggedin', 0);
				// commit the change (removes dirty flag):
				record.commit();
			},
			method: 'POST',
			scope: this
		});
	},
	initComponent: function() {

		this.tbar = [{
			text: this.addText,
			iconCls: 'x-icon-add',
			listeners: {
				"render": function(btn) {
					//alt-a shortcut support for adding a row
					globalKeyMap.accessKey({
						key: 'a',
						alt: true
					}, this.addItem, this);
					//tab shortcut support for adding a row when tab occurs from last cell in a row
					globalKeyMap.accessKey({
						key: "\t"
					}, this.addItem, this);
				},scope: this
			},
				
			handler: function() {
				var grid = this.ownerCt.ownerCt;
				// access the Record constructor through the grid's store
				var Login = Ext.data.Record.create([{
					name: 'username'
				}, {
					name: 'password'
				}, {
					name: 'loggedin'
				}]);

				var p = new Login({
					username: '',
					password: '',
					loggedin: 0
				});
				grid.stopEditing();
				// either insert to the top or add to the bottom.  chose to go with add to the bottom
				//                grid.store.insert(0, p);
				grid.store.add(p);
				grid.getView().refresh();
				grid.getSelectionModel().selectRow(grid.store.getCount() - 1);
				// highlight last row and focus on second column since first column is the delete row icon
				grid.startEditing(grid.store.getCount() - 1, 1);
			}
		}, {
			text: '<span class="underline-shortcut">D</span>elete',
			iconCls: 'x-icon-delete',
			hidden: true,
			listeners: {
				"render": function(btn) {
					//alt-a shortcut support for deleting a row
					globalKeyMap.accessKey({
						key: 'd',
						alt: true
					}, this.deleteItem, this);
				},
				scope: this
			},
			handler: function() {
				var grid = this.ownerCt.ownerCt;
				var record = grid.selModel.getSelected();
				if (record) {
					grid.stopEditing();
					grid.getStore().remove(record);
					grid.getView().refresh();
					// if there are any remaining rows, select the last row
					if (grid.store.getCount() > 0)
						grid.getSelectionModel().selectRow(grid.store.getCount() - 1);
				}
			}
		}, {
			text: 'A<span class="underline-shortcut">u</span>thenticate',
			iconCls: 'x-icon-authenticate',
			hidden: !this.requireAuthentication,
			listeners: {
				"render": function(btn) {
					//alt-a shortcut support for deleting a row
					globalKeyMap.accessKey({
						key: 'u',
						alt: true
					}, this.authenticateItem, this);
				},
				scope: this
			},
			handler: function() {
				var record = this.selModel.getSelected();
				if (record) {
					// modify the value of the row to processing...
					record.set('loggedin', -1);
					// commit the change (removes dirty flag):
					record.commit();
					this.authenticateUser.defer(1500, this, [record]);

				}
			}, scope: this
		}];
		this.selModel = new ext.ux.lc.grid.DeletableRowSelectionModel();
		//this.selModel = new Ext.grid.CheckboxSelectionModel({singleSelect: true});
		this.columns = [
		this.selModel,
		{
			id: 'username',
			header: "Username",
			width: 160,
			sortable: true,
			dataIndex: 'username',
			editor: {
				xtype: 'textfield',
				allowBlank: false
			}
		}, {
			id: 'password',
			header: "Password",
			width: 160,
			sortable: true,
			dataIndex: 'password',
			renderer: function() {
				// if the value is an empty string, show no stars otherwise show a static length block of stars
				if (this.renderer && this.renderer.arguments && this.renderer.arguments.length && this.renderer.arguments.length > 0 && this.renderer.arguments[0] == '')
					return '';
				else
					return '*****';
			},
			editor: {
				xtype: 'textfield',
				inputType: 'password',
				allowBlank: false
			}
		}, {
			header: "Logged In",
			xtype: 'actioncolumn',
			dataIndex: 'loggedin',
			hidden: !this.requireAuthentication,
			width: 50,
			items: [{
				getClass: function(v, meta, rec) { // Or return a class from a function
					var loggedIn = rec.get('loggedin');
					var cls = 'x-icon-alv-failure';
					if (loggedIn==1) {
						this.items[0].tooltip = 'This user has successfully authenticated';
						cls = 'x-icon-alv-success';
					} else if(loggedIn == 0) {
						this.items[0].tooltip = 'This user has not authenticated';
						cls = 'x-icon-alv-failure';
					} else {
						// -1 indicates attempting to log in
						this.items[0].tooltip = 'Authentication in progress...';
						cls = 'x-icon-alv-processing';
					}
					return cls;
				}
			}]
		}];
		// call parent initComponent
		ext.ux.lc.grid.DBLogin.superclass.initComponent.call(this);

	}
});

// register xtype
Ext.reg('alvgriddblogin', ext.ux.lc.grid.DBLogin);

// end of file
