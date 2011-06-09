// create namespace
Ext.namespace('Ext.ux.alvand');

/**
 *Ext.ux.alvand.form.ValidationField Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.form.ValidationField
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
 
Ext.ux.alvand.sbuff = new alvStringBuffer();