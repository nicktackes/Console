Ext.namespace('Ext.ux.alvand');

/**
 * Ext.ux.alvand.LogViewer Extension Class for Ext 3.3 Library.  a polling style log viewer
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.LogViewer
 * @extends Ext.Panel
 */
Ext.ux.alvand.LogViewer = Ext.extend(Ext.Panel, {

	/**
 	* @cfg {String} pause if the log refresh should be paused
 	*/
	_pause : false,

	bodyStyle:{ overflow:'auto'},

	titleCollapse : false,

	collapsible:false,
	closable:true,
	header : false,
	border:true,
	shim  : true,
	layout: 'anchor',
	maxBufferSize: 250,
	defaultRefreshInterval: 5,
	defaultBlockSize: 10,

	initComponent : function() {
		this.items = [];
		this.initToolBar();
		this.items.push(
		{
			title: this.gridResultsTitle,
			id: this.id + '_logviewergrid',
			xtype: 'alvgridlogviewer',
			environ: this.environ,
			anchor:'-2 -2'
		});
		Ext.ux.alvand.LogViewer.superclass.initComponent.call(this);

	},
	getGrid: function() {
		return Ext.getCmp(this.id + '_logviewergrid');
	},
	initToolBar : function() {
		var logFile = new Ext.data.SimpleStore({
			fields: ['displayname', 'filename'],
			data : [
			['Web Server', '/wbs/web.log'],
			['Db Server', '/wbs/db.log'],
			['DataSecure Appliance', '/wbs/appliance.log']
			]
		});

		this.tbar = [{
			loggerId: this.id,
			text : "Start",
			tooltip : "Start streaming the log",
			iconCls: 'alv-start',
			handler: this.start,
			enableToggle : true,
			pressed : false,
			width: 65,
			scope: this
		},{
			text : "Pause",
			tooltip : "Pause/Start log refresh ",
			iconCls: 'alv-pause',
			handler : this.pause,
			enableToggle : true,
			pressed : false,
			width: 65,
			scope: this
		},{
			text : "Reset",
			tooltip : "Clear the log window",
			iconCls: 'alv-reset',
			width: 65,
			handler: this.reset,
			scope: this
		},'-',{
			xtype: 'combo',
			store: logFile,
			displayField:'displayname',
			valueField:'filename',
			typeAhead: true,
			mode: 'local',
			triggerAction: 'all',
			emptyText:'Select log file...',
			selectOnFocus:true,
			value : this.defaultLevel,
			width:135,
			listeners:{
				'afterrender': function(combo) {
					// load in the value if there is only one.
					if(combo.store && combo.store.getCount() > 1) {
						var rec = combo.store.getAt(0);
						if(rec) {
							combo.fireEvent.defer(100, combo, ['change', combo, rec.get('filename'), '']);
							combo.setValue(rec.get('filename'));
						}
					}
				},
				'select':{fn: function(combo, value) {
						var win = this.ownerCt.ownerCt.ownerCt;
						win.setTitle(combo.getRawValue() +' Log');

					}
				},
				'change':{fn: function(combo, newValue, oldValue) {
						var win = this.ownerCt.ownerCt.ownerCt;
						win.setTitle(combo.getRawValue() +' Log');
					}
				}
			}
		}, '->',{
			xtype:'label',
			style: 'color:white;margin-left:5px;margin-right:5px;',
			text : 'Refresh Interval (sec)'
		},{
			id : this.id + '_refreshinterval',
			xtype:'numberfield',
			allowNegative: false,
			allowDecimals: false,
			tooltip: 'how often in seconds to reaquire log entries',
			value : this.defaultRefreshInterval,
			width:50
		},{
			xtype:'label',
			style: 'color:white;margin-left:5px;margin-right:5px;',
			tooltip: 'The maximum number of log entries returned per refresh (to minimize network transport latency)',
			text : 'Response Record Size'
		},{
			id : this.id + '_blockSize',
			xtype:'numberfield',
			allowNegative: false,
			allowDecimals: false,
			value : this.defaultBlockSize,
			width:50
		}];

	},
	start : function(button, e) {
		button.setText((button.pressed?'Stop':'Start'));
		button.setIconClass(button.pressed?'alv-stop':'alv-start');
		if(this.ajaxRequestId) {
			Ext.Ajax.abort(this.ajaxRequestId);
			delete this.ajaxRequestId;
		}
		if(this.logtask) {
			Ext.TaskMgr.stop(this.logtask);
			delete this.logtask;
		}
		if(button.pressed) {
			var intervalFld = Ext.getCmp(this.id + '_refreshinterval');
			var interval = intervalFld.getValue();
			if(isNaN(interval) || interval == 0)
				interval = this.defaultRefreshInterval;
			if(intervalFld) {
				this.logtask = Ext.TaskMgr.start({
					run : this.readLog,
					interval : interval * 1000,
					scope: this
				});
			}
		}
	},
	readLog: function() {
		// TODO: real impl
		if(!this._pause) {
			var connectUrl = this.environ.staticUrl + 'log_response.txt';
			var inputStructure = {};
			// we will use the render event to initiate data load of the tokenized tables as well
			// as partial information (usernames) to populate the dbUser table with
			this.ajaxRequestId = Ext.Ajax.request({
				url: connectUrl,
				success: this.dataLoadSuccess,
				failure: this.dataLoadFailure,
				//params: inputStructure,
				method: 'POST',
				scope: this
			});
		}
	},
	scrollToBottom: function() {
		try {
			var grid = this.getGrid();
			if(grid) {
				var gridEl = grid.getGridEl();
				var rowEl = grid.getView().getRow(grid.getStore().getCount()-1);
				if(rowEl) {
					rowEl.scrollIntoView(gridEl,false);
				}
			}
		} catch (exc) {
			// if an error occurs, just swallow it.  this is non essential and will run on interval anyway.  it only
			// scrolls to bottom of grid
		}
	},
	dataLoadSuccess: function(result, request) {
		// inspect the json response container to verify that the result was successful and no errors were present
		try {
			if (result && result.responseText) {
				var grid = this.getGrid();
				if(grid) {
					var rObj = Ext.decode(result.responseText);
					if(rObj && rObj.logentries) {
						var blockSizeFld = Ext.getCmp(this.id + '_blockSize');
						if(blockSizeFld) {
							var blockSize = blockSizeFld.getValue();
							if(isNaN(blockSize) || blockSize == 0)
								blockSize = this.defaultBlockSize;
							var logarray = (blockSize < rObj.logentries.length?rObj.logentries.slice(0,blockSize):rObj.logentries);

							// kerbe: add in time so that we can see the data changing.  remove once real data hooked in.
							var statusCode = [
							'FATAL',
							'DEBUG','DEBUG','DEBUG','DEBUG','DEBUG','DEBUG','DEBUG','DEBUG',
							'INFO','INFO','INFO','INFO','INFO','INFO','INFO','INFO','INFO','INFO','INFO','INFO',
							'WARN','WARN',
							'ERROR',
							'TRACE','TRACE','TRACE','TRACE','TRACE','TRACE','TRACE','TRACE','TRACE','TRACE','TRACE'
							];

							for(var j=0; j < logarray.length; j++) {
								logarray[j].time = new Date().toUTCString();
								logarray[j].statusCode = statusCode[Math.floor(Math.random()*36)];
							}
							grid.getStore().loadData({logentries:logarray}, true);
							grid.applyLevelFilter();

							if(grid.getStore().getCount() > this.maxBufferSize) {
								grid.getStore().remove(grid.getStore().getRange(0,grid.getStore().getCount()-this.maxBufferSize-1));
							}
							this.scrollToBottom();
							grid.setTotalEntryCount(grid.getStore().getCount());
						}
					}
				}
			}
		} catch (exc) {
			// if an exception occurred, then raise it and fail the response check
			Ext.Msg.show({
				title: 'Could not read log file',
				msg: exc,
				buttons: Ext.Msg.OK,
				animEl: 'elId',
				icon: Ext.MessageBox.ERROR
			});
			return false;
		}
	},
	dataLoadFailure: function(result, request) {
		// inspect the json response container to verify that the result was successful and no errors were present
		try {
			//debugger;
		} catch (exc) {
			// if an exception occurred, then raise it and fail the response check
			Ext.Msg.show({
				title: 'Could not read log file',
				msg: exc,
				buttons: Ext.Msg.OK,
				animEl: 'elId',
				icon: Ext.MessageBox.ERROR
			});
			return false;
		}
	},
	onLogLevelSelect : function(combo, record, index) {
	},
	reset : function() {
		this.getGrid().getStore().removeAll();
		//this.getGrid().getView().refresh();
		//this.count = 0;
		this.getGrid().setTotalEntryCount(grid.getStore().getCount());
	},
	pause : function(button, e) {
		this._pause = button.pressed;
		button.setText((button.pressed?'Resume':'Pause'));
	}
});

// register xtype
Ext.reg('alvlogviewer', Ext.ux.alvand.LogViewer);