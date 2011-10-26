// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.form.CreateToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.form.CreateToken
 * @extends Ext.extend(ext.ux.lc.form.BaseToken
 */
ext.ux.lc.form.QuickTestResultForm = Ext.extend(Ext.Panel, {
	getChart: function() {
		return Ext.getCmp( this.id + '_quicktestchart');
	},
	initComponent: function() {
		this.items = [];
		this.items.push(
		{
			hidden: false,
			id: this.id + '_quicktestchart',
			xtype: 'barchart',
			plugins: [new Ext.ux.plugin.VisibilityMode()],
			width: 500,
			height: 300,
			store: new Ext.data.JsonStore({
				fields: ['testName', 'throughputTokensPerSecond', 'totalElapsedTimeMillis', 'testDescription'],
				data: []
			}),
			yField: 'testName',
			tipRenderer: function(chart, record, index, series) {
				return record.data.testName + '\n'
				+ 'Throughput:  ' + record.data.throughputTokensPerSecond + ' tokens per second \n'
				+ 'Elapsed Time:  ' + record.data.totalElapsedTimeMillis + ' seconds \n'
				+ record.data.testDescription;
			},
			xAxis: new Ext.chart.NumericAxis({
				stackingEnabled: true
			}),
			series: [{
				xField: 'throughputTokensPerSecond',
				displayName: 'Throughput (tokens/second)'
			},{
				xField: 'totalElapsedTimeMillis',
				displayName: 'Elapsed Time (seconds)'
			}],
			chartStyle: {
				legend: {
					display: 'bottom'
				}
			}

		}
		);

		// call parent initComponent
		ext.ux.lc.form.QuickTestResultForm.superclass.initComponent.call(this);
	}
});

// register xtype
Ext.reg('alvformquicktestresult', ext.ux.lc.form.QuickTestResultForm);

// end of file
