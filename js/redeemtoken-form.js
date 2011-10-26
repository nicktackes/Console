// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.form.RedeemToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.form.RedeemToken.js
 *
 * @class ext.ux.lc.form.RedeemToken
 * @extends Ext.extend(ext.ux.lc.form.BaseToken
 */
ext.ux.lc.form.RedeemToken = Ext.extend(ext.ux.lc.form.BaseToken, {
	// IE wraps this title if not in a div with nowrap
	//title: '<div style="white-space:nowrap;">Redeem a Token</div>',
	actionButtonText: 'Redeem',
	resultsGridTitle: 'Redeemed Tokens',
	defaultActionParam: {},
	requestType: 'getBatch',
	staticResponseFile: 'redeemtokenresults',
	iconCls: 'x-icon-subscriptions',
	getCollectionParamName: function() {
		return 'tokenArray';
	},
	getItemDefinitionArray: function() {
		// configure the maskTypeField to redeem
		this.maskTypeField.redeem = true;

		return [this.dbUserField, this.tableNameField, this.naeUserField, this.maskTypeField, this.tokenGrid];
	},
	listeners:{
		'render': function(form) {
			// kerbe: alter the grid column of Value to token, since we redeem values from tokens provided
			var grid = Ext.getCmp(this.id + '_tokengrid');
			grid.colModel.setColumnHeader(1, 'Token');

		}
	}
});

// register xtype
Ext.reg('alvformredeemtoken', ext.ux.lc.form.RedeemToken);

// end of file
