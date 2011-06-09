// create namespace
Ext.namespace('Ext.ux.alvand.form');

/**
 * Ext.ux.alvand.TokenResultWindow Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: Ext.ux.alvand.TokenResultWindow.js
 *
 * @class Ext.ux.alvand.TokenResultWindow
 * @extends Ext.Window
 */
Ext.ux.alvand.QuickTestResultWindow = Ext.extend(Ext.Window, {
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
		Ext.ux.alvand.QuickTestResultWindow.superclass.initComponent.call(this);

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
Ext.reg('alvwindowquicktestresults', Ext.ux.alvand.QuickTestResultWindow);