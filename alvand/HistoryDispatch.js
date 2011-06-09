Ext.namespace('Ext.ux.alvand');
/**
 * HistoryDispatch is a utility class allows for registration of xtype specific history handlers.  If one is found, it will delegate a request
 * to the handler, which is most likely located in the xtype specific class to maintain code encapsulation.
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.HistoryDispatch
 */
Ext.ux.alvand.HistoryDispatch = function(){
    var handlers = {};
    var historyStore = new Ext.data.Store({
        reader: new Ext.data.ArrayReader({}, [{
            name: 'history'
        }, {
            name: 'historyindex'
        }])
    });
    return {
    
        register: function(xtype, _function){
            handlers[xtype] = _function;
        },
		
		getStore: function(){
			return historyStore;
		},
        
        handle: function(scope, parts){
            if (parts && parts.length >= 2) {
                var xtype = parts[0];
                if (handlers[xtype]) 
                    // peel off the xtype and send the rest to the handler
                    handlers[xtype].call(scope, parts.slice(1));
            }
        }
    };
}();

Ext.ux.alvand.regh = Ext.ux.alvand.HistoryDispatch.register;
Ext.ux.alvand.reghh = Ext.ux.alvand.HistoryDispatch.handle;
