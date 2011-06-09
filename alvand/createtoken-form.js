// create namespace
Ext.namespace('Ext.ux.alvand.form');

/**
 * Ext.ux.alvand.form.CreateToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.form.CreateToken
 * @extends Ext.extend(Ext.ux.alvand.form.BaseToken
 */
Ext.ux.alvand.form.CreateToken = Ext.extend(Ext.ux.alvand.form.BaseToken, {
	// IE wraps this title if not in a div with nowrap
	//title: '<div style="white-space:nowrap;">Create a Token</div>',
	actionButtonText: 'Create',
	resultsGridTitle: 'Created Tokens',
	defaultActionParam: {luhnCheck: 1}, 
	requestType: 'insertBatch', 
	staticResponseFile: 'createtokenresults',
	iconCls: 'x-icon-tickets',
	getCollectionParamName: function() {
		return 'valueArray';
	},
	getItemDefinitionArray: function(){
		return [this.dbUserField, this.tableNameField, this.naeUserField, this.maskTypeField, this.tokenGrid];
	}
});

// register xtype
Ext.reg('alvformcreatetoken', Ext.ux.alvand.form.CreateToken);

// end of file
