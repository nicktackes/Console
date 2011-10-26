// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.form.TokenMask Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.form.TokenMask.js
 *
 * @class ext.ux.lc.form.TokenMask
 * @extends Ext.form.ComboBox
 */
ext.ux.lc.form.TokenMask = Ext.extend(Ext.form.ComboBox, {
	// redeeming tokens allows a much slimmer set of valid mask types.  
	redeem: false,
    displayField: 'masktext',
	valueField: 'format',
	hiddenName: 'format',
    typeAhead: true,
    mode: 'local',
    triggerAction: 'all',
    emptyText: 'Select a mask...',
    selectOnFocus: true,
    initComponent: function(){
        var masks = this.redeem?
				[
					['0', 'None'], 
					['6', 'Mask'] 
				]:
				[
	//				['0', 'None'], 
					['1', 'Random'], 
					['2', 'Sequential'], 
					['3', 'Last Four'], 
					['4', 'First Six'], 
					['5', 'First Two Last Four'], 
	//				['6', 'Mask'], 
					['7', 'First Six Last Four'], 
					['8', 'Fixed Nineteen']
				];
        
        // simple array store
        this.store = new Ext.data.SimpleStore({
            fields: ['format', 'masktext'],
            data: masks
        });
        // call parent initComponent
        ext.ux.lc.form.TokenMask.superclass.initComponent.call(this);
        
    }
});

// register xtype
Ext.reg('alvtokenmask', ext.ux.lc.form.TokenMask);

// end of file
