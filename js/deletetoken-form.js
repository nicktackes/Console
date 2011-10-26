// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.form.DeleteToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.form.DeleteToken
 * @extends ext.ux.lc.form.BaseToken
 */
ext.ux.lc.form.DeleteToken = Ext.extend(ext.ux.lc.form.BaseToken, {
	// IE wraps this title if not in a div with nowrap
	//title: '<div style="white-space:nowrap;">Delete a Token</div>',
	actionButtonText: 'Delete',
	resultsGridTitle: 'Deleted Tokens',
	defaultActionParam: {},
	tokenRequestType: 'deleteTokenBatch',
	valueRequestType: 'deleteValueBatch',
	requestType:'deleteValueBatch',
	tokenParamName: 'tokenArray',
	valueParamName: 'valueArray',
	collectionParamName: 'valueArray',
	staticResponseFileRadio: 'deletevalueresults',
	tokenStaticResponseFile: 'deletetokenresults',
	valueStaticResponseFile: 'deletevalueresults',
	iconCls: 'x-icon-delete',
	getCollectionParamName: function() {
		return this.collectionParamName;
	},
	getStaticResponseFile: function(){
		return this.staticResponseFileRadio;
	},
	getItemDefinitionArray: function() {
		return [this.dbUserField, this.tableNameField, this.naeUserField, this.maskTypeField, this.locateByField, this.tokenGrid];
	},
	initFieldDefinitions: function() {
		this.locateByField = {
			xtype: 'radiogroup',
			tabIndex: 5,
			fieldLabel: 'Locate By',
			items: [{
				boxLabel: 'Value',
				name: 'locateby',
				inputValue: 'value',
				checked: true,
				handler: function(radio, checked) {
					if (checked) {
						var grid = Ext.getCmp(this.id + '_tokengrid');
						grid.colModel.setColumnHeader(1, 'Value');
						this.requestType = this.valueRequestType;
						this.collectionParamName = this.valueParamName;
						this.staticResponseFileRadio = this.valueStaticResponseFile;
					}
				},
				scope: this
			}, {
				boxLabel: 'Token',
				name: 'locateby',
				inputValue: 'token',
				handler: function(radio, checked) {
					if (checked) {
						var grid = Ext.getCmp(this.id + '_tokengrid');
						grid.colModel.setColumnHeader(1, 'Token');
						this.requestType = this.tokenRequestType;
						this.collectionParamName = this.tokenParamName;
						this.staticResponseFileRadio = this.tokenStaticResponseFile;
					}
				},
				scope: this
			}]
		};
		// call parent initComponent
		ext.ux.lc.form.DeleteToken.superclass.initFieldDefinitions.call(this);

	}
});

// register xtype
Ext.reg('alvformdeletetoken', ext.ux.lc.form.DeleteToken);

// end of file
