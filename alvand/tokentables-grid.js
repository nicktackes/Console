// create namespace
Ext.namespace('Ext.ux.alvand.grid');

/**
 * Ext.ux.alvand.grid.TokenizedTables Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: Ext.ux.alvand.grid.TokenizedTables.js
 *
 * @class Ext.ux.alvand.grid.TokenizedTables
 * @extends Ext.grid.EditorGridPanel
 */
Ext.ux.alvand.grid.TokenizedTables = Ext.extend(Ext.grid.GridPanel, {
	staticResponseFile: 'savetokenizedtables',
	addText: '<span class="underline-shortcut">A</span>dd',
	//autoExpandColumn: 'tableName',
	height: 250,
	frame: true,
	addTokenTableRecord: function(formValues) {
		// access the Record constructor through the grid's store
		var TokenTable = Ext.data.Record.create([
		{
			name: 'tableName'
		}, {
			name: 'hmacKey'
		}, {
			name: 'encryptionKey'
		}, {
			name: 'dbUser'
		}, {
			name: 'queryDurationMillis'
		}, {
			name: 'recordCount'
		}, {
			name: 'sequential'
		}, {
			name: 'datalength'
		}, {
			name: 'record_deleted'
		}, {
			name: 'record_new'
		}]);

		var p = new TokenTable({
			//id: grid.environ.communicator.guid(),
			tableName: formValues.tableName,
			hmacKey: formValues.hmacKey,
			encryptionKey: formValues.encryptionKey,
			dbUser: formValues.dbUser,
			sequential: (formValues.isSequential == 'on'?true:false),
			datalength: (formValues.dataLength?formValues.dataLength:0),
			queryDurationMillis: (formValues.queryDurationMillis?formValues.queryDurationMillis:0),
			recordCount: (formValues.recordCount?formValues.recordCount:0),
			record_new: true
		});
		// either insert to the top or add to the bottom.  chose to go with add to the bottom
		//                grid.store.insert(0, p);
		this.store.add(p);
		this.getView().refresh();
		this.getSelectionModel().selectRow(this.store.getCount() - 1);
	},
	initComponent: function() {
		// add in CheckColumn support for sequential column.  this will create a perpetually editable column so that the renderer essentially
		// never shows.
		var sequentialColumn = new Ext.grid.CheckColumn({
			hidden: true,
			header: 'Sequential',
			dataIndex: 'sequential',
			width: 55
		});
		this.plugins = sequentialColumn;
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
				// create add token table modal window
				// output the results to a dialog window
				if(!this.addwin) {
					this.addwin = new Ext.Window({
						title: 'Add Tokenized Table',
						layout: 'fit',
						width: 440,
						height: 320,
						plain: true,
						closeAction: 'hide',
						modal: false,
						environ: this.environ,
						items:[{
							xtype:'alvformcreatetokentable',
							gridId: this.id,
							environ: this.environ,
							naeUserstore: this.naeUserstore,
							dbUserStore: this.dbUserStore,
							tokentablestore: this.store
						}]
					});
				}
				this.addwin.show(this);
			}, scope: this
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
					record.set('record_deleted', true);
					//grid.stopEditing();
					grid.getStore().remove(record);
					//grid.getView().refresh();
					// if there are any remaining rows, select the last row
					if (grid.store.getCount() > 0)
						grid.getSelectionModel().selectRow(grid.store.getCount() - 1);
				}
			}
		}, {
			text: 'Refresh',
			iconCls: 'alv-reset',
			handler: function() {
				var grid = this.ownerCt.ownerCt;
				if(grid) {
					if(grid.ownerCt && grid.ownerCt.items && grid.ownerCt.items.length > 0) {
						var dbUser = grid.ownerCt.items.items[0].getValue();
						if(dbUser) {
							var store = MyDesktop.dbUserStore;
							if(store && store.data && store.data.items) {
								for (var i = 0; i < store.data.items.length; i++) {
									if (store.data.items[i].data && store.data.items[i].data.username == dbUser) {
										var dbPassword = store.data.items[i].data.password;
										if(dbPassword) {
											// overwrite if it exists
											//grid.stopEditing();
											Ext.ux.alvand.UserTokenTableStores.register(dbUser, dbPassword, true);
											//grid.startEditing(0, 0);
											grid.getView().refresh();
											return true;
										}
									}
								}

							}
						}
					}
				}
			}
		}];
		//this.selModel = new Ext.ux.alvand.grid.DeletableRowSelectionModel();
		this.columns = [
		//this.selModel,
		//{
		//    hidden: true,
		//    id: 'id',
		//    dataIndex: 'id'
		//},
		{
			id: 'tableName',
			header: "Table Name",
			width: 100,
			sortable: true,
			dataIndex: 'tableName',
			editor: {
				xtype: 'textfield',
				allowBlank: false,
				selectOnFocus: true
			}
		}, {
			header: "HMAC Key",
			width: 100,
			sortable: true,
			dataIndex: 'hmacKey',
			editor: {
				xtype: 'textfield',
				allowBlank: false,
				selectOnFocus: true
			}
		}, {
			header: "Encryption Key",
			width: 100,
			sortable: true,
			dataIndex: 'encryptionKey',
			editor: {
				xtype: 'textfield',
				allowBlank: false,
				selectOnFocus: true
			}
		}, {
			header: "DB Login",
			width: 120,
			sortable: true,
			dataIndex: 'dbUser',
			editor: {
				xtype: 'alvlogincombo',
				navigatorId: this.navigatorId,
				loginType: 'DB',
				store: this.dbUserStore,
				allowBlank: false
			}
		}, {
			header: "Query Time(ms)",
			width: 100,
			sortable: true,
			dataIndex: 'queryDurationMillis',
			editor: {
				xtype: 'numberfield',
				selectOnFocus: true
			}
		}, {
			header: "Rowcount",
			width: 100,
			sortable: true,
			dataIndex: 'recordCount',
			editor: {
				xtype: 'numberfield',
				selectOnFocus: true
			}
		}, sequentialColumn, {
			header: "Data Length",
			hidden: true,
			width: 100,
			sortable: true,
			dataIndex: 'datalength',
			editor: {
				xtype: 'numberfield',
				selectOnFocus: true
			}
		}, {
			xtype: 'actioncolumn',
			dataIndex: 'record_errors',
			width: 50,
			items: [{
				getClass: function(v, meta, rec) { // Or return a class from a function
					var recordErrors = rec.get('record_errors');
					if (recordErrors && recordErrors.length && recordErrors.length > 0) {
						var sb = new alvStringBuffer();
						sb.append("Validation Errors:<UL>");
						for (var i = 0; i < recordErrors.length; i++) {
							sb.append('<LI>');
							sb.append(recordErrors[i].message);
						}
						sb.append('</UL>');

						this.items[0].tooltip = sb.toString();
						return 'x-icon-saveerror';
					} else {
						this.items[0].tooltip = undefined;
						return 'x-icon-blank';
					}
				}
			}]
		}, {
			hidden: true,
			dataIndex: 'record_deleted',
			xtype: 'booleancolumn'
		}, {
			hidden: true,
			dataIndex: 'record_new',
			xtype: 'booleancolumn'
		}];

		// call parent initComponent
		Ext.ux.alvand.grid.TokenizedTables.superclass.initComponent.call(this);

	}
});

// register xtype
Ext.reg('alvgridtokentables', Ext.ux.alvand.grid.TokenizedTables);

// end of file
