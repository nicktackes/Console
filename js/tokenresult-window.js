// create namespace
Ext.namespace('ext.ux.lc');

/**
 * ext.ux.lc.TokenResultWindow Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.TokenResultWindow.js
 *
 * @class ext.ux.lc.TokenResultWindow
 * @extends Ext.Window
 */
ext.ux.lc.TokenResultWindow = Ext.extend(Ext.Window, {
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
        ext.ux.lc.TokenResultWindow.superclass.initComponent.call(this);
        
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
Ext.reg('alvwindowtokenresults', ext.ux.lc.TokenResultWindow);

// end of file
