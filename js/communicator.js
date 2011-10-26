// create namespace
Ext.namespace('ext.ux.lc');

/**
 * Communicator is a utility class that assists with wrapping data requests and unwrapping their responses.
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.Communicator
 */
ext.ux.lc.Communicator = function(){
    return {
        // takes a deserialized json object that adheres to the response structure.  Also passes in the original request
        // for possibly improved diagnosis output in the event of failure.  
        // {
        // success: true,
        // msg: "",
        // data: [
        // {
        // value: "8800adfasdfads",
        // token: "35udsafdlkjldfhkd"
        // },{
        // value: "7777adfasdfads",
        // token: "25udsafdlkjldfhkd"
        // }
        // ]
        // }
        responseCheck: function(rObj, request){
            try {
                // was a result obtained?
                if (rObj) {
                    if (rObj.success) 
                        return true;
                    else {
                        // result was retrieved successfully but the server reported failure
                        Ext.Msg.show({
                            title: 'Server Error',
                            msg: (rObj.msg ? rObj.msg : 'A server error occurred attempting to retrieve data but no specific message was reported.'),
                            buttons: Ext.Msg.OK,
                            animEl: 'elId',
                            icon: Ext.MessageBox.ERROR
                        });
                        return false;
                    }
                }
                else {
                    // the result did not decode into a json object properly
                    Ext.Msg.show({
                        title: 'Critical Error',
                        msg: 'An error occurred attempting to decode the json data from the server.',
                        buttons: Ext.Msg.OK,
                        animEl: 'elId',
                        icon: Ext.MessageBox.ERROR
                    });
                    return false;
                }
            } 
            catch (exc) {
                // if an exception occurred, then raise it and fail the response check
                Ext.Msg.show({
                    title: 'Critical Error',
                    msg: exc,
                    buttons: Ext.Msg.OK,
                    animEl: 'elId',
                    icon: Ext.MessageBox.ERROR
                });
                return false;
            }
        },
        responseCheck2: function(rObj, request, responseType){
            try {
				var ns = 'ns:';
                // was a result obtained?
                if (rObj) {
                    if (rObj[ns+responseType] && rObj[ns+responseType][ns+'return']) 
                        return true;
                    else {
                        // result was retrieved successfully but the server reported failure
                        Ext.Msg.show({
                            title: 'Server Error',
                            msg: (rObj.msg ? rObj.msg : 'A server error occurred attempting to retrieve data but no specific message was reported.'),
                            buttons: Ext.Msg.OK,
                            animEl: 'elId',
                            icon: Ext.MessageBox.ERROR
                        });
                        return false;
                    }
                }
                else {
                    // the result did not decode into a json object properly
                    Ext.Msg.show({
                        title: 'Critical Error',
                        msg: 'An error occurred attempting to decode the json data from the server.',
                        buttons: Ext.Msg.OK,
                        animEl: 'elId',
                        icon: Ext.MessageBox.ERROR
                    });
                    return false;
                }
            } 
            catch (exc) {
                // if an exception occurred, then raise it and fail the response check
                Ext.Msg.show({
                    title: 'Critical Error',
                    msg: exc,
                    buttons: Ext.Msg.OK,
                    animEl: 'elId',
                    icon: Ext.MessageBox.ERROR
                });
                return false;
            }
        },
        getResponseObject: function(result){
            // inspect the json response container to verify that the result was successful and no errors were present
            try {
                if (result && result.responseText) {
                    var rObj = Ext.decode(result.responseText);
                    return rObj;
                }
                else {
                    // result was retrieved successfully but the server report failure
                    Ext.Msg.show({
                        title: 'Server Error',
                        msg: 'An error occurred attempting to ajax load data from the server.  No result was obtained',
                        buttons: Ext.Msg.OK,
                        animEl: 'elId',
                        icon: Ext.MessageBox.ERROR
                    });
                }
            } 
            catch (exc) {
                // if an exception occurred, then raise it and fail the response check
                Ext.Msg.show({
                    title: 'Critical Error',
                    msg: exc,
                    buttons: Ext.Msg.OK,
                    animEl: 'elId',
                    icon: Ext.MessageBox.ERROR
                });
                return false;
            }
        },
        dataLoadFailure: function(result, request){
            // result was retrieved successfully but the server report failure
            Ext.Msg.show({
                title: 'Server Ajax Error',
                msg: 'An error occurred attempting to ajax load data from the server.',
                buttons: Ext.Msg.OK,
                animEl: 'elId',
                icon: Ext.MessageBox.ERROR
            });
        },
        
        S4: function(){
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        
        // generate a guid - not really, but this will act as a stub
        guid: function(){
            return ('a' + this.S4() + this.S4() + this.S4() + this.S4() + this.S4() + this.S4() + this.S4() + this.S4());
        },
		
        bundleRequest: function(url, meta, payload, successCallback, failureCallback, scope){
			Ext.Ajax.request({
                url: url,
                params: {
					meta: Ext.encode(meta),
                    payload: Ext.encode(payload)
                },
                success: successCallback,
                failure: failureCallback,
                scope: scope
            });
        },
        getStaticResultFile: function(staticResponseFile, valid){
        	return staticResponseFile+(valid?'_valid.txt':'_invalid.txt')
        }
    };
}();
