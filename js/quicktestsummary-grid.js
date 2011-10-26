// create namespace
Ext.namespace('ext.ux.lc.grid');

/**
 * ext.ux.lc.grid.DBLogin Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.grid.QuickTestSummaryGrid
 * @extends Ext.grid.GridPanel
 */
ext.ux.lc.grid.QuickTestSummaryGrid = Ext.extend(Ext.grid.GridPanel, {
	requireAuthentication: true,
	//	autoExpandColumn: 'username',
	height: 250,
	frame: true,
	resWins: {},
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
	updateTestStatus: function(recordId, fieldName, statusValue, resultData) {
		var idx = this.getStore().find('id', recordId);
		if(idx > -1) {
			var record = this.getStore().getAt(idx);
			if(record) {
				record.set(fieldName, statusValue);
				if(resultData)
					record.set(fieldName+'Results', Ext.encode(resultData));
			}
		}
	},
	showResultWindow: function(record, testType, title) {
		var id = record.get('id');
		if(!this.resWins[id + testType]) {
			this.resWins[id + testType] = new ext.ux.lc.QuickTestResultWindow({
				environ: this.environ,
				title: title
			});
		}
		var jsonVals = record.get(testType+'Results');
		// if in static mode we will mock the response from a text file
		this.resWins[id + testType].setPayload(jsonVals);
		this.resWins[id + testType].show();
	},
	initComponent: function() {
		this.store = new Ext.data.Store({
			reader: new Ext.data.ArrayReader({idProperty: 'id'}, [{
				name: 'id'
			}, {
				name: 'testDate'
			}, {
				name: 'dbUser'
			}, {
				name: 'tableName'
			}, {
				name: 'naeUser'
			}, {
				name: 'masktype'
			}, {
				name: 'serverSideApiTest'
			}, {
				name: 'webServerTest'
			}, {
				name: 'serverSideApiTestResults'
			}, {
				name: 'webServerTestResults'
			}])
		});

		this.tbar = [{
			text: '<span class="underline-shortcut">D</span>elete',
			iconCls: 'x-icon-delete',
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
		}];
		this.selModel = new ext.ux.lc.grid.DeletableRowSelectionModel();
		//this.selModel = new Ext.grid.CheckboxSelectionModel({singleSelect: true});
		this.columns = [
		this.selModel,
		{
			id: 'id',
			dataIndex: 'id',
			hidden: true
		}, {
			header: "Test Date",
			width: 140,
			sortable: true,
			xtype: 'datecolumn',
			format:"Y-m-d H:i:sO",
			dataIndex: 'testDate'
		}, {
			header: "DB User",
			width: 90,
			sortable: true,
			dataIndex: 'dbUser'
		}, {
			header: "Table Name",
			width: 100,
			sortable: true,
			dataIndex: 'tableName'
		}, {
			header: "DataSecure User",
			width: 90,
			sortable: true,
			dataIndex: 'naeUser'
		}, {
			header: "Mask Type",
			width: 90,
			sortable: true,
			dataIndex: 'masktype'
		}, {
			dataIndex: 'serverSideApiTestResults',
			hidden: true
		}, {
			dataIndex: 'webServerTestResults',
			hidden: true
		}, {
			header: "Server Side Test",
			xtype: 'actioncolumn',
			dataIndex: 'serverSideApiTest',
			width: 80,
			items: [{
				getClass: function(v, meta, rec) { // Or return a class from a function
					// 1 indicates success
					// 0 indicates failure
					// -1 indicate in process
					// -99 indicates not in progress and not has not started
					var testStatus = rec.get('serverSideApiTest');
					var cls = 'x-icon-alv-failure';
					if (testStatus==1) {
						this.items[0].tooltip = 'The test is complete.  Click to view results.';
						cls = 'x-icon-alv-success';
					} else if(testStatus == 0) {
						this.items[0].tooltip = 'A failure occurred in conducting the test.';
						cls = 'x-icon-alv-failure';
					}  else if(testStatus == -99) {
						this.items[0].tooltip = 'Test has not started...';
						cls = 'x-icon-blank';
					} else {
						// -1 indicates attempting to log in
						this.items[0].tooltip = 'Test in progress...';
						cls = 'x-icon-alv-processing';
					}
					return cls;
				},
				handler: function(grid, rowIndex, colIndex) {
					var rec = grid.getStore().getAt(rowIndex);
					grid.showResultWindow(rec, this.dataIndex, 'Server Side API Test- ' + rec.get('testDate').format('Y-m-d H:i:sO'));
				}
			}]
		}, {
			header: "Web Server Test",
			xtype: 'actioncolumn',
			dataIndex: 'webServerTest',
			width: 80,
			items: [{
				getClass: function(v, meta, rec) { // Or return a class from a function
					var testStatus = rec.get('webServerTest');
					var cls = 'x-icon-alv-failure';
					if (testStatus==1) {
						this.items[0].tooltip = 'The test is complete.  Click to view results.';
						cls = 'x-icon-alv-success';
					} else if(testStatus == 0) {
						this.items[0].tooltip = 'A failure occurred in conducting the test.';
						cls = 'x-icon-alv-failure';
					} else if(testStatus == -99) {
						this.items[0].tooltip = 'Test has not started...';
						cls = 'x-icon-blank';
					}  else {
						// -1 indicates attempting to log in
						this.items[0].tooltip = 'Test in progress...';
						cls = 'x-icon-alv-processing';
					}
					return cls;
				},
				handler: function(grid, rowIndex, colIndex) {
					var rec = grid.getStore().getAt(rowIndex);
					grid.showResultWindow(rec, this.dataIndex, 'Web Server Test - ' + rec.get('testDate').format('Y-m-d H:i:sO'));
				}
			}]
		}];
		// call parent initComponent
		ext.ux.lc.grid.QuickTestSummaryGrid.superclass.initComponent.call(this);

	}
});

// register xtype
Ext.reg('alvgridquicktestsummary', ext.ux.lc.grid.QuickTestSummaryGrid);

// end of file
