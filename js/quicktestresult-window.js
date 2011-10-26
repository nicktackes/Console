// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.TokenResultWindow Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.TokenResultWindow.js
 *
 * @class ext.ux.lc.TokenResultWindow
 * @extends Ext.Window
 */
ext.ux.lc.QuickTestResultWindow = Ext.extend(Ext.Window, {
	payload: '{}',
	title: 'Results',
	layout: 'fit',
	width: 500,
	height: 350,
	plain: true,
	closeAction: 'hide',
	modal: false,
	initComponent: function() {
		this.items = [];
		this.items.push({
			border: false,
			items: [
			{
				title: this.gridResultsTitle,
				id: this.id + '_quicktestresultform',
				xtype: 'alvformquicktestresult',
				environ: this.environ,
				layout: 'fit'
			}]
		});
		this.buttons = [{
			text: 'Close',
			handler: function() {
				this.hide();
			},
			scope: this
		}];

		// call parent initComponent
		ext.ux.lc.QuickTestResultWindow.superclass.initComponent.call(this);

	},
	setPayload: function(payload) {
		var resultData = Ext.decode(payload);
		var resForm = Ext.getCmp(this.id + '_quicktestresultform');
		if(resForm) {
			var chart = resForm.getChart();
			if(chart) {
				chart.store.loadData(resultData);
			}

		}
	}
});

// register xtype
Ext.reg('alvwindowquicktestresults', ext.ux.lc.QuickTestResultWindow);