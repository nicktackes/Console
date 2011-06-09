// create namespace
Ext.namespace('Ext.ux.alvand.form');

/**
 * Ext.ux.alvand.form.TokenMask Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: Ext.ux.alvand.form.TokenMask.js
 *
 * @class Ext.ux.alvand.form.TokenMask
 * @extends Ext.form.ComboBox
 */
Ext.ux.alvand.form.TokenMask = Ext.extend(Ext.form.ComboBox, {
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
        Ext.ux.alvand.form.TokenMask.superclass.initComponent.call(this);
        
    }
});

// register xtype
Ext.reg('alvtokenmask', Ext.ux.alvand.form.TokenMask);

// end of file
