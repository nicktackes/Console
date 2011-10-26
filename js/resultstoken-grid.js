// create namespace
Ext.namespace('ext.ux.lc.grid');

/**
 * ext.ux.lc.grid.ResultToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.grid.ResultToken.js
 *
 * @class ext.ux.lc.grid.ResultToken
 * @extends Ext.grid.GridPanel
 */
ext.ux.lc.grid.ResultToken = Ext.extend(Ext.grid.GridPanel, {
	viewConfig: {
		templates: {
			cell: new Ext.Template(
			'<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} x-selectable {css}" style="{style}" tabIndex="0" {cellAttr}>',
			'<div class="x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
			'</td>'
			)
		}
	},
	environ: {},
	autoExpandColumn: 'value',
	height: 250,
	frame: true,
	addItem: function() {
		var tb = this.getTopToolbar();
		var firstItem = tb.items.items[0];
		if (firstItem) {
			firstItem.handler.call(firstItem.scope || firstItem, firstItem);
		}
	},
	deleteItem: function() {
		var tb = this.getTopToolbar();
		var firstItem = tb.items.items[1];
		if (firstItem) {
			firstItem.handler.call(firstItem.scope || firstItem, firstItem);
		}
	},
	initComponent: function() {
		this.columns = [{
			id: 'value',
			header: "Value",
			width: 160,
			sortable: true,
			dataIndex: 'value'
		}, {
			header: "Token",
			width: 160,
			sortable: true,
			dataIndex: 'token'
		}, {
			header: "Exec Time(ms)",
			width: 100,
			sortable: true,
			dataIndex: 'executionTimeMillis',
			editor: {
				xtype: 'numberfield',
				selectOnFocus: true
			}
		}, {
			xtype: 'actioncolumn',
			dataIndex: 'statusCode',
			width: 50,
			items: [{
				getClass: function(v, meta, rec) { // Or return a class from a function
					var statusCode = rec.get('statusCode');
					var statusDescription = rec.get('statusDescription');
					if(statusDescription && statusDescription.length > 0) {
						this.items[0].tooltip = statusDescription;
					}
					if (statusCode == 'SUCCESS') {
						return 'x-icon-alv-success';
					} else {
						return 'x-icon-alv-failure';
					}
				}
			}]
		}, {
			hidden: true,
			dataIndex: 'statusDescription'
		}];

		this.store = new Ext.data.Store({
			reader: new Ext.data.JsonReader({
				root: 'data',
				idProperty: 'value',
				storeId: this.id + '_rStore'
			}, [{
				name: 'value'
			}, {
				name: 'token'
			}, {
				name: 'executionTimeMillis',
				type: 'int'
			}, {
				name: 'statusCode'
			}, {
				name: 'statusDescription'
			}])
		});

		// call parent initComponent
		ext.ux.lc.grid.ResultToken.superclass.initComponent.call(this);

	},
	requestTokens: function(payload, defaultParam, requestType, isStatic, staticResponseFile, paramName, serviceProvider) {
		// store the request type for later usage upon successful load.  needed for decoding of results
		this.requestType = requestType;
		ext.ux.lc.UserTokenTableStores.requestTokens(payload, defaultParam, requestType, isStatic, staticResponseFile, paramName, serviceProvider, this, this.dataLoadSuccess);
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
								ext.ux.lc.UserTokenTableStores.processTrxResultObject(resultData, resultObj[i]);
							}
						} else {
							ext.ux.lc.UserTokenTableStores.processTrxResultObject(resultData, resultObj);
						}
					}
					this.store.loadData({data:resultData});
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
	}
});

// register xtype
Ext.reg('alvgridresultstoken', ext.ux.lc.grid.ResultToken);

// end of file

