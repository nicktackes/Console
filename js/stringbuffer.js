// create namespace
Ext.namespace('ext.ux.lc');

/**
 *ext.ux.lc.form.ValidationField Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.form.ValidationField
 * @extends Ext.form.TextField
 */
function alvStringBuffer() { 
   this.buffer = []; 
 } 

 alvStringBuffer.prototype.append = function append(string) { 
   this.buffer.push(string); 
   return this; 
 }; 

 alvStringBuffer.prototype.toString = function toString() { 
   return this.buffer.join(""); 
 }; 
 
ext.ux.lc.sbuff = new alvStringBuffer();