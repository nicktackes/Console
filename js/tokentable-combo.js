// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.form.TokenTableComboBox Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.form.TokenTableComboBox.js
 *
 * @class ext.ux.lc.form.TokenTableComboBox
 * @extends Ext.form.ComboBox
 */
ext.ux.lc.form.TokenTableComboBox = Ext.extend(Ext.form.ComboBox, {
    displayField: 'tableName',
    valueField: 'tableName',
    typeAhead: true,
    mode: 'local',
    triggerAction: 'all',
    emptyText: 'Select a table...',
    selectOnFocus: true,
    initComponent: function(){
        // call parent initComponent
        ext.ux.lc.form.TokenTableComboBox.superclass.initComponent.call(this);
    },
    onTriggerClick: function(e){
        // if the store is empty, then raise a messagebox allowing them to enter a login
        if (!this.store.data || this.store.getCount() == 0) {
            Ext.Msg.show({
                title: 'Table Registration Needed',
                msg: 'There are no tokenized tables registered. Would you like to register a tokenizable table?',
                buttons: Ext.Msg.YESNO,
                fn: function(sResp){
                    if (sResp == "yes") {
                    	// TODO: in order to support both UI strategies, we will explicitly
                    	// look for MyDesktop which is global in the desktop metaphor, otherwise
                    	// we will find the navigator.  todo: enable the desktop to function as the navigator.
						var nav = (MyDesktop?MyDesktop:Ext.getCmp(this.navigatorId));
						if(nav){
							nav.displayTokenTableForm();
						}
                    }
                },
				scope: this,
                animEl: 'elId',
                icon: Ext.MessageBox.QUESTION
            });
        }
		else
			ext.ux.lc.form.TokenTableComboBox.superclass.onTriggerClick.call(this,e);
    }
});

// register xtype
Ext.reg('alvtokentablecombo', ext.ux.lc.form.TokenTableComboBox);

// end of file
