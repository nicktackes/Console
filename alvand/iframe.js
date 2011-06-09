// create namespace
Ext.namespace('Ext.ux.alvand');

/**
 * Ext.ux.alvand.IFrameComponent Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.IFrameComponent
 * @extends Ext.BoxComponent
 */
Ext.ux.alvand.IFrameComponent = Ext.extend(Ext.BoxComponent, {
     onRender : function(ct, position){
          this.el = ct.createChild({tag: 'iframe', id: 'iframe-'+ this.id, frameBorder: 0, src: this.url});
     }
});

// register xtype
Ext.reg('alviframe', Ext.ux.alvand.IFrameComponent);

// end of file
