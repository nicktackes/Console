// create namespace
Ext.namespace('Ext.ux.alvand.form');

/**
 * Ext.ux.alvand.form.BaseToken Extension Class for Ext 3.3 Library.  an abstract base class for token management forms
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.form.BaseToken
 * @extends Ext.form.FormPanel
 */
Ext.ux.alvand.form.BaseToken = Ext.extend(Ext.form.FormPanel, {
	serviceProvider: 'SafenetTokenService',
	allowClearForm: true,
	itemDefinitionArray: [],
	style: 'padding: 5px;',
	frame: true,
	border: true,
	bodyStyle: 'padding:5px 5px 0;',
	autoScroll: true,
	anchor: '-20',
	//	monitorValid: true,
	listeners: {
		'render': function(panel) {
			var firstField = Ext.getCmp(panel.id + '_dbUser');
			if(firstField) {
				firstField.focus(true, 1500);
			}
		}
	},
	getStaticResponseFile: function() {
		return this.staticResponseFile;
	},
	getRequestType: function() {
		return this.requestType;
	},
	clearTheForm: function() {
		this.getForm().reset();
		// clear grid
		var grid = this.getTokenGrid();
		if(grid) {
			grid.getStore().removeAll();
			grid.getView().refresh();
		}
	},
	initComponent: function() {
		if(this.allowClearForm) {
			this.tbar = [{
				text: 'Clear',
				iconCls: 'alv-start',
				handler: function() {
					var formPanel = this.ownerCt.ownerCt;
					//reset the form
					if(formPanel) {
						formPanel.clearTheForm();
					}
				}
			}];
		}
		this.initFieldDefinitions();
		this.items = [];
		this.items.push({
			title: this.title,
			labelWidth: 120,
			border: false,
			defaults: {
				width: 230
			},
			defaultType: 'textfield',
			xtype: 'fieldset',
			items: this.getItemDefinitionArray()

		});
		// call parent initComponent
		Ext.ux.alvand.form.BaseToken.superclass.initComponent.call(this);

	},
	getItemDefinitionArray: function() {
		return [];
	},
	getDBLoginValue: function(name) {
		if (this.initialConfig.dbUserStore && this.initialConfig.dbUserStore.data && this.initialConfig.dbUserStore.data.items) {
			for (var i = 0; i < this.initialConfig.dbUserStore.data.items.length; i++) {
				if (this.initialConfig.dbUserStore.data.items[i].data && this.initialConfig.dbUserStore.data.items[i].data.username == name)
					return this.initialConfig.dbUserStore.data.items[i].data.password;
			}
		}
		return null;
	},
	getHSMLoginValue: function(name) {
		if (this.initialConfig.naeUserstore && this.initialConfig.naeUserstore.data && this.initialConfig.naeUserstore.data.items) {
			for (var i = 0; i < this.initialConfig.naeUserstore.data.items.length; i++) {
				if (this.initialConfig.naeUserstore.data.items[i].data && this.initialConfig.naeUserstore.data.items[i].data.username == name)
					return this.initialConfig.naeUserstore.data.items[i].data.password;
			}
		}
		return null;
	},
	getTokenGrid: function() {
		return Ext.getCmp(this.id + '_tokengrid');
	},
	getCollectionParamName: function() {
		return 'params';
	},
	getMaskField: function(){
		return Ext.getCmp(this.id + '_maskTypeField');
	},
	initFieldDefinitions: function() {
		this.dbUserField = {
			fieldLabel: 'DB User',
			id: this.id + '_dbUser',
			name: 'dbUser',
			tabIndex: 1,
			xtype: 'alvlogincombo',
			environ: this.environ,
			navigatorId: this.navigatorId,
			loginType: 'DB',
			store: this.dbUserStore,
			allowBlank: false,
			listeners:{
				'select':{fn: function(combo, value) {
						var tableNames = Ext.getCmp(combo.ownerCt.ownerCt.id + '_tableName');
						if(tableNames) {
							var store = Ext.ux.alvand.UserTokenTableStores.getStore(combo.getValue());
							if(store) {
								tableNames.store = store;
							}
						}
					}
				},
				'change':{fn: function(combo, newValue, oldValue) {
						var tableNames = Ext.getCmp(combo.ownerCt.ownerCt.id + '_tableName');
						if(tableNames) {
							var store = Ext.ux.alvand.UserTokenTableStores.getStore(newValue);
							if(store) {
								tableNames.store = store;
							}
						}
					}
				}
			}
		};
		this.tableNameField = {
			fieldLabel: 'Table Name',
			id: this.id + '_tableName',
			name: 'tableName',
			tabIndex: 2,
			xtype: 'alvtokentablecombo',
			environ: this.environ,
			store: this.tokentablestore,
			navigatorId: this.navigatorId,
			allowBlank: false
		};
		this.naeUserField = {
			fieldLabel: 'DataSecure User',
			name: 'naeUser',
			requireAuthentication: false,
			tabIndex: 3,
			xtype: 'alvlogincombo',
			environ: this.environ,
			navigatorId: this.navigatorId,
			loginType: 'HSM',
			store: this.naeUserstore,
			allowBlank: false
		};
		this.maskTypeField = {
			id: this.id + '_maskTypeField',
			fieldLabel: 'Mask Type',
			name: 'masktype',
			tabIndex: 4,
			xtype: 'alvtokenmask',
			environ: this.environ,
			allowBlank: false
		};
		this.tokenGrid = {
			xtype: 'panel',
			style: 'padding: 30px;',
			width: 400,
			items: {
				id: this.id + '_tokengrid',
				xtype: 'alvgridcreatetoken',
				environ: this.environ,
				addText: '<span class="underline-shortcut">A</span>dd'
			},
			buttons: [{
				text: this.actionButtonText,
				//formBind: true,
				handler: function(btn, event) {
					var frm = this.getForm();
					if (frm) {
						var formVals = frm.getValues();
						var grid = this.getTokenGrid();
						// if the grid has modified records, then add those values in
						if (grid) {
							var vs = grid.store.getModifiedRecords();
							var gridArray = new Array();
							for (var i = 0; i < vs.length; i++) {
								if(!vs[i].data.record_deleted)
									gridArray.push(vs[i].getChanges());
							}
						}
						if(formVals.dbUser)
							formVals.dbPassword = this.getDBLoginValue(formVals.dbUser);
						if(formVals.naeUser)
							formVals.naePassword = this.getHSMLoginValue(formVals.naeUser);
						formVals.values = gridArray;

						var jsonVals = Ext.encode(formVals);
						// output the results to a dialog window
						if(!this.reswin) {
							this.reswin = new Ext.ux.alvand.TokenResultWindow({
								environ: this.environ,
								gridResultsTitle: this.resultsGridTitle
							});
						}
						// if in static mode we will mock the response from a text file
						this.reswin.setPayload(jsonVals,this.defaultActionParam,this.getRequestType(),this.environ.staticContent,this.environ.communicator.getStaticResultFile(this.getStaticResponseFile(), this.environ.validContent), this.getCollectionParamName(), this.serviceProvider);
						this.reswin.show(this);

					}
				},
				scope: this
			}]
		};
	}
});

// register xtype
Ext.reg('alvformbasetoken', Ext.ux.alvand.form.BaseToken);

// end of file
