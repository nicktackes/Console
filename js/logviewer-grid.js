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
ext.ux.lc.grid.LogViewerGrid = Ext.extend(Ext.grid.GridPanel, {
	viewConfig:{
		forceFit: true
	},
	environ: {},
	//	autoExpandColumn: 'text',
	//height: 250,
	frame: true,
	initComponent: function() {
		this.initToolBar();
		var textAreaRenderer = function() {
			return '<textarea readonly class="x-form-textarea x-form-field">' + arguments[0] +'</textarea>'
		};
		function columnWrap(val) {
			return '<div style="white-space:normal !important;">'+ val +'</div>';
		};

		this.columns = [{
			//id: 'text',
			//xtype: 'textarea',
			header: "Time",
			width: 40,
			sortable: true,
			dataIndex: 'time'
		}, {
			xtype: 'actioncolumn',
			header:'Level',
			sortable: true,
			dataIndex: 'statusCode',
			width: 10,
			items: [{
				getClass: function(v, meta, rec) { // Or return a class from a function
					var statusCode = rec.get('statusCode');
					if (statusCode == 'FATAL') {
						return 'alv-log-fatal';
					} else if(statusCode=='ERROR') {
						return 'alv-log-error';
					} else if(statusCode=='WARN') {
						return 'alv-log-warn';
					} else if(statusCode=='INFO') {
						return 'alv-log-info';
					} else if(statusCode=='DEBUG') {
						return 'alv-log-debug';
					} else {
						//trace
						return 'alv-log-trace';
					}
				}
			}]
		},{
			//id: 'text',
			//xtype: 'textarea',
			header: "Log Entry",
			//width: 160,
			sortable: true,
			dataIndex: 'text',
			renderer: columnWrap
		}];

		this.store = new Ext.data.Store({
			reader: new Ext.data.JsonReader({
				root: 'logentries',
				storeId: this.id + '_rStore'
			}, [{
				name: 'time'
			},{
				name: 'text'
			}, {
				name: 'statusCode'
			}])
		});

		// call parent initComponent
		ext.ux.lc.grid.LogViewerGrid.superclass.initComponent.call(this);

	},
	setTotalEntryCount: function(ct) {
		Ext.getCmp(this.id + '_entryCount').setValue(ct);
	},
	applyLevelFilter: function(combo) {
		var combobox = (combo?combo:Ext.getCmp(this.id + '_loglevel'));
		if(combobox) {
			// if the value is not an empty value, the apply a filter to the level column
			if(combobox.getValue() != 'ALL') {
				this.getStore().filter([
				{
					property     : 'statusCode',
					value        : combobox.getValue(),
					anyMatch     : false,
					caseSensitive: false,
					exactMatch: true
				}]);
			} else {
				this.getStore().clearFilter();
			}

		}
	},
	initToolBar : function() {
		var logLevelStore = new Ext.data.SimpleStore({
			fields: ['level', 'text'],
			data : [
			['ALL', 'All'],
			['FATAL', 'Fatal'],
			['ERROR', 'Error'],
			['WARN', 'Warning'],
			['INFO', 'Information'],
			['DEBUG', 'Debug'],
			['TRACE', 'Trace']
			]
		});

		this.tbar = [{
			id : this.id + '_loglevel',
			xtype: 'combo',
			store: logLevelStore,
			displayField:'text',
			valueField:'level',
			typeAhead: true,
			mode: 'local',
			triggerAction: 'all',
			emptyText:'Select logging level...',
			selectOnFocus:true,
			value : this.defaultLevel,
			width:135,
			forceSelection: true,
			listeners:{
				'afterrender': function(combo) {
					// load in the value if there is only one.
					if(combo.store && combo.store.getCount() > 1) {
						var rec = combo.store.getAt(0);
						if(rec) {
							combo.fireEvent.defer(100, combo, ['change', combo, rec.get('level'), '']);
							combo.setValue(rec.get('level'));
						}
					}
				},
				'select':{fn: function(combo, value) {
						this.applyLevelFilter(combo);
					}
				},
				'change':{fn: function(combo, newValue, oldValue) {
						this.applyLevelFilter(combo);
					}
				}, scope: this
			}
		}, '->',{
			xtype:'label',
			style: 'color:white;margin-left:5px;margin-right:5px;',
			text : 'Total Entries'
		},{
			id : this.id + '_entryCount',
			xtype:'numberfield',
			allowNegative: false,
			allowDecimals: false,
			readOnly: true,
			value : 0,
			width:50
		}]
	}
});

// register xtype
Ext.reg('alvgridlogviewer', ext.ux.lc.grid.LogViewerGrid);

// end of file

