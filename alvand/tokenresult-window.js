// create namespace
Ext.namespace('Ext.ux.alvand');

/**
 * Ext.ux.alvand.TokenResultWindow Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: Ext.ux.alvand.TokenResultWindow.js
 *
 * @class Ext.ux.alvand.TokenResultWindow
 * @extends Ext.Window
 */
Ext.ux.alvand.TokenResultWindow = Ext.extend(Ext.Window, {
	gridResultsTitle: '',
    payload: '{}',
    title: 'Results',
    layout: 'fit',
    width: 500,
    height: 300,
    plain: true,
    closeAction: 'hide',
    modal: false,
    listeners: {
        'beforeshow': function(win){
            var ta = Ext.getCmp(win.id + '_payload');
            if (ta) {
                ta.setValue(win.payload);
            }
        }
    },
    initComponent: function(){
        this.items = [];
        this.items.push({
            border: false,
            items: [
			{
                title: this.gridResultsTitle,
				id: this.id + '_tokenresultsgrid',
				xtype: 'alvgridresultstoken',
				environ: this.environ,
                layout: 'fit'
            }]
        });
        this.buttons = [{
            text: 'Close',
            handler: function(){
                this.hide();
            },
            scope: this
        }];
        
        // call parent initComponent
        Ext.ux.alvand.TokenResultWindow.superclass.initComponent.call(this);
        
    },

    setPayload: function(payload, defaultParam, requestType, isStatic, staticResponseFile, paramName, serviceProvider){
        this.payload = payload;
		this.requestType = requestType;
		var resGrid = Ext.getCmp(this.id + '_tokenresultsgrid');
		if(resGrid)
			resGrid.requestTokens(payload, defaultParam, requestType, isStatic, staticResponseFile, paramName, serviceProvider);
    }
});

// register xtype
Ext.reg('alvwindowtokenresults', Ext.ux.alvand.TokenResultWindow);

// end of file
