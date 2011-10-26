// create namespace
Ext.namespace('ext.ux.lc');

/**
 * ext.ux.lc.IFrameComponent Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.IFrameComponent
 * @extends Ext.BoxComponent
 */
ext.ux.lc.IFrameComponent = Ext.extend(Ext.BoxComponent, {
     onRender : function(ct, position){
          this.el = ct.createChild({tag: 'iframe', id: 'iframe-'+ this.id, frameBorder: 0, src: this.url});
     }
});

// register xtype
Ext.reg('alviframe', ext.ux.lc.IFrameComponent);

// end of file
