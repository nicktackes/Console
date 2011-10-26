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
ext.ux.lc.form.CreateToken = Ext.extend(ext.ux.lc.form.BaseToken, {
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
Ext.reg('alvformcreatetoken', ext.ux.lc.form.CreateToken);

// end of file
