Ext.namespace('ext.ux.lc');
/**
 * HistoryDispatch is a utility class allows for registration of xtype specific history handlers.  If one is found, it will delegate a request
 * to the handler, which is most likely located in the xtype specific class to maintain code encapsulation.
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.HistoryDispatch
 */
ext.ux.lc.HistoryDispatch = function(){
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

ext.ux.lc.regh = ext.ux.lc.HistoryDispatch.register;
ext.ux.lc.reghh = ext.ux.lc.HistoryDispatch.handle;
